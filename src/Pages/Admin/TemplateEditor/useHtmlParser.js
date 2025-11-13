// useHtmlParser.js for TemplateEditor
import { useState } from "react";

export const useHtmlParser = () => {
  const [allStyles, setAllStyles] = useState("");
  const [htmlHead, setHtmlHead] = useState("");
  const [htmlAttributes, setHtmlAttributes] = useState("");
  const [templateBody, setTemplateBody] = useState("");
  
  // 🔄 States cho các phần đã parse
  const [headerBody, setHeaderBody] = useState("");
  const [metaBlocks, setMetaBlocks] = useState("");
  const [signBody, setSignBody] = useState("");
  const [footerBody, setFooterBody] = useState("");
  const [editableBody, setEditableBody] = useState("");

  const parseHtmlFromBE = (rawHtml) => {
    if (!rawHtml) return {};

    console.group("=== PARSING HTML FROM BE (TÁCH CÁC PHẦN RÕ RÀNG) ===");
    console.log("Raw HTML length:", rawHtml.length);

    // 1) Tách <style> và lấy head/body/attrs
    const headSection = rawHtml.match(/<head[^>]*>[\s\S]*?<\/head>/i)?.[0] || '';
    const styleRegex = /<style[^>]*>[\s\S]*?<\/style>/gi;
    const styles = headSection.match(styleRegex)?.join("\n") || "";
    const cleaned = rawHtml.replace(
      headSection,
      headSection.replace(styleRegex, "")
    );
    const headMatch = cleaned.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
    const bodyMatch = cleaned.match(/<body[^>]*>([\s\S]*?)<\/body>/i);

    const _htmlHead = headMatch ? headMatch[1].trim() : "";
    const _htmlAttributes = (rawHtml.match(/<html([^>]*)>/i)?.[1] || "").trim();
    let bodyContent = bodyMatch ? bodyMatch[1].trim() : "";

    // 2) 🔥 SỬ DỤNG DOMParser THAY VÌ REGEX - KHÔNG BAO GIỜ SAI THẺ ĐÓNG
    console.log('🔧 Using DOMParser for precise HTML parsing');
    
    const parser = new DOMParser();
    const doc = parser.parseFromString(rawHtml, "text/html");
    
    // Tách từng phần bằng querySelector - CHÍNH XÁC 100%
    const headerElement = doc.querySelector(".non-editable-header");
    const headerBody = headerElement ? headerElement.outerHTML : '';
    
    // Tách meta-block (có thể có nhiều block)
    const metaBlockElements = doc.querySelectorAll(".meta-block");
    const metaBlocks = Array.from(metaBlockElements).map(el => el.outerHTML).join('') || '';
    
    // Tách sign block
    const signElement = doc.querySelector(".sign-block");
    const signBody = signElement ? signElement.outerHTML : '';
    
    // Tách footer
    const footerElement = doc.querySelector(".footer");
    const footerBody = footerElement ? footerElement.outerHTML : '';
    
    // Remove các phần đã tách từ DOM để lấy editableBody
    headerElement?.remove();
    metaBlockElements.forEach(el => el.remove());
    signElement?.remove();
    footerElement?.remove();
    
    // Phần editable body (chỉ Điều 1 -> Điều N) - KHÔNG CÒN REGEX
    const editableBody = doc.body.innerHTML.trim();

    // Lấy full HTML để dùng cho HTML tab
    const fullHtml = rawHtml;

    // 3) Tạo template body để rebuild (giữ cấu trúc ban đầu)
    const _templateBody = bodyContent;

    console.log("✅ DOMParser results:");
    console.log(" - Header body length:", headerBody.length);
    console.log(" - Meta blocks length:", metaBlocks.length);
    console.log(" - Editable body length:", editableBody.length);
    console.log(" - Sign body length:", signBody.length);
    console.log(" - Footer body length:", footerBody.length);
    
    // 🔍 Debug: Kiểm tra thẻ đóng của meta-block
    if (metaBlocks) {
      const hasClosingDiv = metaBlocks.includes('</div>');
      console.log(" - Meta-block has closing </div>:", hasClosingDiv);
      if (!hasClosingDiv) {
        console.warn("🚨 META-BLOCK MISSING CLOSING </div>!");
      }
    }
    
    console.groupEnd();

    return {
      fullHtml,           // toàn bộ HTML cho HTML tab
      htmlHead: _htmlHead,
      allStyles: styles,
      htmlAttributes: _htmlAttributes,
      headerBody,         // phần header (quốc hiệu, tiêu đề)
      metaBlocks,         // Bên A / B  
      editableBody,       // phần nội dung chính (Điều 1 → Điều 10)
      signBody,           // block chữ ký
      footerBody,         // footer (Trang n / n)
      templateBody: _templateBody
    };
  };

  /**
   * 🔥 SIMPLE REBUILD - GIỮ NGUYÊN editableBody 100%
   * ❌ ĐÃ LOẠI BỎ: superDecodeMultiLayer, fixBrokenHtmlStructure, formatHtmlBody
   * ✅ CHỈ LÀM: Ghép lại header + meta + editableBody + sign + footer
   * 
   * THAM SỐ:
   *  - editableBody: nội dung chính từ TinyMCE (GIỮ NGUYÊN)
   *  - headerBody, metaBlocks, signBody, footerBody: các phần cố định
   *  - externalAllStyles: styles từ cache
   */
  const rebuildCompleteHtml = ({ 
    editableBody, 
    headerBody = '', 
    metaBlocks = '', 
    signBody = '', 
    footerBody = '', 
    subject = 'Template',
    externalAllStyles
  }) => {
    if (!editableBody) return "";

    console.group("=== 🔥 SIMPLE REBUILD - GIỮ NGUYÊN editableBody ===");
    console.log("Input editableBody length:", editableBody.length);
    console.log("Input preview:", editableBody.substring(0, 200));

    // ❗ GIỮ NGUYÊN editableBody - chỉ trim khoảng trắng
    const cleanEditableBody = (editableBody || "").trim();

    console.log("✅ editableBody preserved without processing");

    // Ghép lại body theo thứ tự: header + meta + editable + sign + footer
    const finalBody = [
      headerBody,
      metaBlocks, 
      cleanEditableBody,
      signBody,
      footerBody
    ].filter(Boolean).join('\n\n');

    // Giữ nguyên styles (không thêm bớt gì, chỉ bỏ tag <style> lồng)
    let mergedStyles = (externalAllStyles || allStyles || "").trim();
    const cleanedStyles = mergedStyles
      .replace(/<\/?style[^>]*>/g, '')
      .trim();

    const styleWrapped = cleanedStyles
      ? `<style>${cleanedStyles}</style>`
      : "";

    const finalHtml = `<!doctype html>
<html${htmlAttributes ? " " + htmlAttributes : ""}>
<head>
${htmlHead || ""}
${styleWrapped}
</head>
<body>
${finalBody}
</body>
</html>`;

    console.log("Final HTML length:", finalHtml.length);
    console.groupEnd();

    return finalHtml;
  };

  const updateParsedStructure = (parsed) => {
    setAllStyles(parsed.allStyles || "");
    setHtmlHead(parsed.htmlHead || "");
    setHtmlAttributes(parsed.htmlAttributes || "");
    setTemplateBody(parsed.templateBody || "");
    
    // 🔄 Lưu các phần đã parse
    setHeaderBody(parsed.headerBody || "");
    setMetaBlocks(parsed.metaBlocks || "");
    setSignBody(parsed.signBody || "");
    setFooterBody(parsed.footerBody || "");
    setEditableBody(parsed.editableBody || "");
  };

  const resetStructureStates = () => {
    setAllStyles("");
    setHtmlHead("");
    setHtmlAttributes("");
    setTemplateBody("");
    
    // 🔄 Reset các phần đã parse
    setHeaderBody("");
    setMetaBlocks("");
    setSignBody("");
    setFooterBody("");
    setEditableBody("");
  };

  return {
    // states
    allStyles, htmlHead, htmlAttributes, templateBody,
    // 🔄 parsed parts
    headerBody, metaBlocks, signBody, footerBody, editableBody,
    // apis
    parseHtmlFromBE,
    rebuildCompleteHtml,
    updateParsedStructure,
    resetStructureStates,
    // setters (nếu cần)
    setAllStyles, setHtmlHead, setHtmlAttributes
  };
};
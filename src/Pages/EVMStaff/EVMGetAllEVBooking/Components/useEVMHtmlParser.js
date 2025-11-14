// useEVMHtmlParser.js - HTML Parser cho EVM Staff dựa trên Template Editor pattern
import { useState } from "react";

export const useEVMHtmlParser = () => {
  const [allStyles, setAllStyles] = useState("");
  const [htmlHead, setHtmlHead] = useState("");
  const [htmlAttributes, setHtmlAttributes] = useState("");
  const [templateBody, setTemplateBody] = useState("");
  
  // 🔄 States cho các phần đã parse - GIỐNG TEMPLATE EDITOR
  const [headerBody, setHeaderBody] = useState("");
  const [metaBlocks, setMetaBlocks] = useState("");
  const [signBody, setSignBody] = useState("");
  const [footerBody, setFooterBody] = useState("");
  const [editableBody, setEditableBody] = useState("");

  // 🔥 PARSE HTML TỪNG PHẦN - COPY LOGIC TỪ TEMPLATE EDITOR
  const parseHtmlFromBE = (rawHtml) => {
    if (!rawHtml) return {};

    console.group("=== EVM PARSING HTML FROM BE (TÁCH CÁC PHẦN RÕ RÀNG) ===");
    console.log("Raw HTML length:", rawHtml.length);

    // 1) Tách <style> và lấy head/body/attrs - GIỐNG TEMPLATE EDITOR
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

    // 2) 🔥 SỬ DỤNG DOMParser THAY VÌ REGEX - CHÍNH XÁC 100% NHƯ TEMPLATE EDITOR
    console.log('🔧 Using DOMParser for precise HTML parsing (EVM version)');
    
    const parser = new DOMParser();
    const doc = parser.parseFromString(rawHtml, "text/html");
    
    // Tách từng phần bằng querySelector - CHÍNH XÁC 100%
    const headerElement = doc.querySelector(".non-editable-header");
    const headerBody = headerElement ? headerElement.outerHTML : '';
    
    // 🔥 Tách meta-block - SỬA LỖI LỌTHOLE GIỐNG TEMPLATE EDITOR
    const metaBlockElements = doc.querySelectorAll(".meta-block, .meta-info, [class*='meta']");
    let metaBlocks = '';
    const metaBlocksArray = [];
    
    metaBlockElements.forEach(el => {
      metaBlocksArray.push(el.outerHTML);
    });
    metaBlocks = metaBlocksArray.join('') || '';
    
    // Tách sign block
    const signElement = doc.querySelector(".sign-block");
    const signBody = signElement ? signElement.outerHTML : '';
    
    // Tách footer
    const footerElement = doc.querySelector(".footer");
    const footerBody = footerElement ? footerElement.outerHTML : '';
    
    // 🔥 Remove CÁC PHẦN ĐÃ TÁCH - ĐẢM BẢO REMOVE HẾT
    headerElement?.remove();
    // Remove tất cả meta blocks
    metaBlockElements.forEach(el => {
      if (el && el.parentNode) {
        el.parentNode.removeChild(el);
      }
    });
    signElement?.remove();
    footerElement?.remove();
    
    // 🔍 DOUBLE CHECK - Tìm và remove thêm meta blocks còn sót
    const remainingMeta = doc.querySelectorAll('[class*="meta"], .meta-block, .meta-info');
    remainingMeta.forEach(el => {
      if (el && el.parentNode) {
        console.log('🚨 EVM: Found remaining meta block, removing:', el.className);
        el.parentNode.removeChild(el);
      }
    });

    // 🔥 PHẦN EDITABLE BODY - DOUBLE CHECK LOẠI BỎ META BLOCKS
    let editableBodyRaw = doc.body.innerHTML.trim();
    
    // 🚨 DOUBLE CHECK - Loại bỏ meta blocks còn sót bằng regex
    editableBodyRaw = editableBodyRaw
      .replace(/<div[^>]*class[^>]*meta[^>]*>[\s\S]*?<\/div>/gi, '')
      .replace(/<div[^>]*meta-block[^>]*>[\s\S]*?<\/div>/gi, '')
      .replace(/<div[^>]*meta-info[^>]*>[\s\S]*?<\/div>/gi, '')
      .replace(/<!--.*?meta.*?-->/gi, '')
      .trim();
    
    const editableBody = editableBodyRaw;

    // Lấy full HTML để dùng cho HTML tab
    const fullHtml = rawHtml;

    // 3) Tạo template body để rebuild (giữ cấu trúc ban đầu)
    const _templateBody = bodyContent;

    console.log("✅ EVM DOMParser results:");
    console.log(" - Header body length:", headerBody.length);
    console.log(" - Meta blocks length:", metaBlocks.length);
    console.log(" - Editable body length:", editableBody.length);
    console.log(" - Sign body length:", signBody.length);
    console.log(" - Footer body length:", footerBody.length);
    
    // 🔍 Debug: Kiểm tra meta blocks trong editableBody
    const hasMetaInEditable = editableBody.toLowerCase().includes('meta');
    console.log(" - EVM editableBody contains 'meta':", hasMetaInEditable);
    if (hasMetaInEditable) {
      console.warn("🚨 EVM EDITABLE BODY STILL CONTAINS META CONTENT!");
      console.log(" - EVM editableBody preview:", editableBody.substring(0, 500));
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
   * 🔥 SIMPLE REBUILD CHO EVM - GIỐNG TEMPLATE EDITOR
   * ❌ ĐÃ LOẠI BỎ: superDecodeMultiLayer, fixBrokenHtmlStructure, formatHtmlBody
   * ✅ CHỈ LÀM: Ghép lại header + meta + editableBody + sign + footer
   */
  const rebuildCompleteHtml = ({ 
    editableBody, 
    headerBody = '', 
    metaBlocks = '', 
    signBody = '', 
    footerBody = '', 
    subject = 'EContract',
    externalAllStyles
  }) => {
    if (!editableBody) return "";

    console.group("=== 🔥 EVM SIMPLE REBUILD - GIỮ NGUYÊN editableBody ===");
    console.log("Input editableBody length:", editableBody.length);
    console.log("Input preview:", editableBody.substring(0, 200));

    // ❗ GIỮ NGUYÊN editableBody - chỉ trim khoảng trắng
    const cleanEditableBody = (editableBody || "").trim();

    console.log("✅ EVM editableBody preserved without processing");

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

    console.log("EVM Final HTML length:", finalHtml.length);
    console.groupEnd();

    return finalHtml;
  };

  // Update parsed structure - GIỐNG TEMPLATE EDITOR
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

  // Reset structure states - GIỐNG TEMPLATE EDITOR
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
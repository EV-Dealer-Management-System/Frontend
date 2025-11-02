// useHtmlParser.js
import { useState, useMemo } from "react";


export const useHtmlParser = () => {
  const [allStyles, setAllStyles] = useState("");
  const [htmlHead, setHtmlHead] = useState("");
  const [htmlAttributes, setHtmlAttributes] = useState("");
  const [preservedWrappers, setPreservedWrappers] = useState([]);
  const [templateBody, setTemplateBody] = useState("");

 const PRESERVE_SELECTORS = [".center", ".meta", ".sign"]; // cho phép sửa section-title

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

    // 2) Tách các phần theo HTML mẫu của bạn
    const dom = document.createElement('div');
    dom.innerHTML = bodyContent;

    // Tách Header chỉ phần non-editable-header (không bao gồm các paragraph Căn cứ và Hôm nay)
    const headerRegex = /<div class="non-editable-header">[\s\S]*?<\/div>/i;
    const headerBody = bodyContent.match(headerRegex)?.[0] || '';

    // Tách Meta blocks (Bên A, Bên B)
    const metaBlockRegex = /<div class="meta-block">[\s\S]*?<\/div>/gi;
    const metaBlocks = bodyContent.match(metaBlockRegex)?.join('') || '';

    // Tách Sign block
    const signBlockRegex = /<table[^>]*class="sign-block"[\s\S]*?<\/table>/i;
    const signBody = bodyContent.match(signBlockRegex)?.[0] || '';

    // Tách Footer
    const footerRegex = /<div class="footer">[\s\S]*?<\/div>/i;
    const footerBody = bodyContent.match(footerRegex)?.[0] || '';

    // Phần editable body (chỉ Điều 1 -> Điều N)
    let editableBody = bodyContent
      .replace(headerRegex, '')  // bỏ header
      .replace(metaBlockRegex, '') // bỏ meta blocks
      .replace(signBlockRegex, '') // bỏ sign block
      .replace(footerRegex, '')    // bỏ footer
      .trim();

    // Lấy full HTML để dùng cho Preview và HTML tab
    const fullHtml = rawHtml;
    console.log("Head length:", _htmlHead.length);
    console.log("Body length (before):", bodyContent.length);

    // 3) Tạo template body để rebuild (giữ cấu trúc ban đầu)
    const _templateBody = bodyContent;

    console.log("Parsed results:");
    console.log(" - Header body length:", headerBody.length);
    console.log(" - Meta blocks length:", metaBlocks.length);
    console.log(" - Editable body length:", editableBody.length);
    console.log(" - Sign body length:", signBody.length);
    console.log(" - Footer body length:", footerBody.length);
    console.groupEnd();

    return {
      fullHtml,           // toàn bộ HTML cho Preview và HTML tab
      htmlHead: _htmlHead,
      allStyles: styles,
      htmlAttributes: _htmlAttributes,
      headerBody,         // phần header (quốc hiệu, tiêu đề)
      metaBlocks,         // Bên A / B  
      editableBody,       // phần nội dung chính (Điều 1 → Điều 10)
      signBody,           // block chữ ký
      footerBody,         // footer (Trang n / n)
      templateBody: _templateBody,
      preservedWrappers: [] // giữ để tương thích
    };
  };

  /**
   * Rebuild hoàn chỉnh với cấu trúc mới:
   *  - editableBody: nội dung Điều 1 -> Điều N từ Quill
   *  - headerBody, metaBlocks, signBody, footerBody: các phần cố định
   *  - subject: tiêu đề
   *  - externalAllStyles: styles lưu cache (nếu có)
   */
  const rebuildCompleteHtml = ({ 
    editableBody, 
    headerBody = '', 
    metaBlocks = '', 
    signBody = '', 
    footerBody = '', 
    subject = 'Hợp đồng điện tử',
    externalAllStyles
  }) => {
    if (!editableBody) return "";

    // Ghép lại body theo thứ tự: header + meta + editable + sign + footer
    const finalBody = [
      headerBody,
      metaBlocks, 
      editableBody,
      signBody,
      footerBody
    ].filter(Boolean).join('\n\n');

    // Merge styles
    let mergedStyles = (externalAllStyles || allStyles || "").trim();
    if (!/\.center\s*\{[^}]*text-align\s*:\s*center[^}]*\}/i.test(mergedStyles)) {
      mergedStyles += "\n.center { text-align: center; }";
    }

    // Luôn wrap lại toàn bộ style block
    const styleWrapped = `<style>\n${mergedStyles.replace(/<\/?style[^>]*>/g, '')}\n</style>`;

    const finalHtml = `<!doctype html>
<html${htmlAttributes ? " " + htmlAttributes : ""}>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${subject || "Hợp đồng điện tử"}</title>
${htmlHead}
${styleWrapped}
</head>
<body>
${finalBody}
</body>
</html>`;

    console.group("=== REBUILT HTML STRUCTURE ===");
    console.log("Final body length:", finalBody.length);
    console.log("Styles length:", (mergedStyles || "").length);
    console.groupEnd();

    return finalHtml;
  };

  const updateParsedStructure = (parsed) => {
    setAllStyles(parsed.allStyles || "");
    setHtmlHead(parsed.htmlHead || "");
    setHtmlAttributes(parsed.htmlAttributes || "");
    setPreservedWrappers(parsed.preservedWrappers || []);
    setTemplateBody(parsed.templateBody || "");
  };

  const resetStructureStates = () => {
    setAllStyles("");
    setHtmlHead("");
    setHtmlAttributes("");
    setPreservedWrappers([]);
    setTemplateBody("");
  };

  return {
    // states
    allStyles, htmlHead, htmlAttributes, preservedWrappers, templateBody,
    // apis
    parseHtmlFromBE,
    rebuildCompleteHtml,
    updateParsedStructure,
    resetStructureStates,
    // setters (nếu cần)
    setAllStyles, setHtmlHead, setHtmlAttributes
  };
};

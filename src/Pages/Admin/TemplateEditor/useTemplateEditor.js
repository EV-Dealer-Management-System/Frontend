import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getAllTemplates, updateTemplate } from "../../../App/Admin/TemplateEditor";

// simple HTML parser (thay bằng useHtmlParser nếu cần giữ 100% tính năng)
const parseHtmlFromBE = (rawHtml = "") => {
  const allStyles = [];
  const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
  let match;
  while ((match = styleRegex.exec(rawHtml))) {
    allStyles.push(match[1]);
  }
  const noStyles = rawHtml.replace(styleRegex, "");
  const headMatch = noStyles.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
  const headContent = headMatch ? headMatch[1] : "";
  const htmlAttrMatch = noStyles.match(/<html([^>]*)>/i);
  const htmlAttrs = htmlAttrMatch ? htmlAttrMatch[1] : "";
  let bodyContent = "";
  const bodyMatch = noStyles.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (bodyMatch) bodyContent = bodyMatch[1];
  else bodyContent = noStyles;

  return {
    bodyContent,
    allStyles: allStyles.join("\n"),
    headContent,
    htmlAttrs,
  };
};

const rebuildCompleteHtml = (bodyContent = "", subject = "", extras = {}) => {
  const { allStyles = "", headContent = "", htmlAttrs = "" } = extras;
  const stylesTag = allStyles?.trim() ? `<style>${allStyles}</style>` : "";
  const head = `<head>${headContent || ""}${stylesTag}</head>`;
  const htmlOpen = `<html${htmlAttrs || ""}>`;
  return `${htmlOpen}${head}<body>${bodyContent || ""}</body></html>`;
};

export const useTemplateEditor = () => {
  // list
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [total, setTotal] = useState(0);

  // editor
  const [editableBody, setEditableBody] = useState(null);
  const [centerBlock, setCenterBlock] = useState("");
  const [signBlock, setSignBlock] = useState("");
  const [metaBlock, setMetaBlock] = useState("");
  const [fullHtml, setFullHtml] = useState("");

  // modal/editor
  const [visible, setVisible] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  // content & parse pieces
  const [htmlContent, setHtmlContent] = useState(""); // body only
  const [parsed, setParsed] = useState({
    allStyles: "",
    headContent: "",
    htmlAttrs: "",
  });

  // flags
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const loadedTemplateIdRef = useRef(null); // tránh load trùng template
  const fetchedRef = useRef(false);         // tránh fetch list lặp

  // ====== LIST ======
  const fetchTemplates = useCallback(async (page = 1, size = 10000) => {

    if (typeof page === 'object') {
      page = 1;
    }
    if (typeof size === 'object') {
      size = 10000;
    }
    if (loading) return;
    setLoading(true);
    try {
      console.log('🔄 Fetching templates...');
      const res = await getAllTemplates(page, size);
      if (res?.success) {
        setTemplates(res.data || []);
        setTotal(res.total || 0);
        console.log("📋 Templates loaded:", res.data?.length || 0);
      } else {
        console.error('❌ Failed to fetch templates:', res?.message);
        setTemplates([]);
        setTotal(0);
      }
    } catch (error) {
      console.error('❌ Error fetching templates:', error);
      setTemplates([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [loading]);

  // React 19 dev double-effect -> chặn lặp
  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    fetchTemplates(1, 10000);
  }, [fetchTemplates]);

  // ====== OPEN/CLOSE ======
  const openEditor = useCallback((tpl) => {
    setSelectedTemplate(tpl || null);
    setVisible(true);
  }, []);

  const closeEditor = useCallback(() => {
    setVisible(false);
    setSelectedTemplate(null);
    setHtmlContent("");
    setParsed({ allStyles: "", headContent: "", htmlAttrs: "" });
    setHasUnsavedChanges(false);
    loadedTemplateIdRef.current = null;
  }, []);

  // ====== LOAD ONE TEMPLATE (chỉ 1 lần cho cùng template) ======
  useEffect(() => {
    const run = async () => {
      if (!visible || !selectedTemplate) return;
      if (loadedTemplateIdRef.current === selectedTemplate.id) return;

      console.log("📋 Loading template:", selectedTemplate.code, selectedTemplate.name);

      // selectedTemplate.contentHtml là rawHtml từ BE (theo API response)
      const rawHtml = selectedTemplate.contentHtml || "";
      const parsedResult = parseHtmlFromBE(rawHtml);

      setParsed({
        allStyles: parsedResult.allStyles || "",
        headContent: parsedResult.headContent || "",
        htmlAttrs: parsedResult.htmlAttrs || "",
      });

      setHtmlContent(parsedResult.bodyContent || ""); // body vào quill
      loadedTemplateIdRef.current = selectedTemplate.id;
      setHasUnsavedChanges(false);
    };
    run();
  }, [visible, selectedTemplate]);

  // ====== SAVE ======
  const saveTemplate = useCallback(async (getCurrentContent) => {
    if (!selectedTemplate) return { success: false, message: 'No template selected' };
    
    try {
      console.log('💾 Saving template...');
      
      // Lấy content từ getCurrentContent (có thể là function hoặc string)
      const finalContent = typeof getCurrentContent === 'function'
        ? getCurrentContent()
        : (getCurrentContent || htmlContent);

      console.log('📝 Final content to save:', finalContent?.substring(0, 200) + '...');

      // gọi API lưu với content đã được process
      const res = await updateTemplate(
        selectedTemplate.code, 
        selectedTemplate.name,
        finalContent
      );
      
      if (res?.success) {
        console.log('✅ Template saved successfully');
        setHasUnsavedChanges(false);
        // Refresh danh sách để hiển thị thay đổi mới
        await fetchTemplates(1, 10);
        return { success: true, message: 'Template saved successfully' };
      } else {
        console.error('❌ Failed to save template:', res?.message);
        return { success: false, message: res?.message || 'Save failed' };
      }
    } catch (error) {
      console.error('❌ Error saving template:', error);
      return { success: false, message: error.message || 'Save error' };
    }
  }, [selectedTemplate, htmlContent, parsed, fetchTemplates]);

  const buildMergedBody = useCallback((currentEditable) => {
    return [
      centerBlock,
      metaBlock,
      currentEditable,
      signBlock
    ].filter(Boolean).join("\n");
  }, [centerBlock, metaBlock, signBlock]);

  // ====== INGEST TEMPLATE (for Modal direct load) ======
  const ingestTemplate = useCallback((tpl) => {
    console.log("===== [ingestTemplate] SIMPLIFIED =====");
    if (!tpl) return;
    
    // Đơn giản hóa - chỉ set selected template và basic states
    setSelectedTemplate(tpl);
    setHasUnsavedChanges(false);
    loadedTemplateIdRef.current = tpl.id ?? null;
    
    console.log("Template ingested:", tpl.name);
  }, []);

 
  return {
    // list
    loading, templates, total, fetchTemplates,

    // modal/editor
    visible, openEditor, closeEditor,
    selectedTemplate,

    // content
    htmlContent, setHtmlContent,
    fullHtml, setFullHtml,

    // flags
    hasUnsavedChanges, setHasUnsavedChanges,

    // actions
    saveTemplate,
    ingestTemplate,
  };
};
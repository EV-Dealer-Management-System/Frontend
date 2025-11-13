import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getAllTemplates, updateTemplate } from "../../../App/Admin/TemplateEditor";

// REMOVED: parseHtmlFromBE cũ - chỉ dùng useHtmlParser

// REMOVED: rebuildCompleteHtml cũ - chỉ dùng useHtmlParser.rebuildCompleteHtml

export const useTemplateEditor = () => {
  // list
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [total, setTotal] = useState(0);

  // modal/editor
  const [visible, setVisible] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  // content (simplified)
  const [htmlContent, setHtmlContent] = useState(""); // for compatibility
  const [fullHtml, setFullHtml] = useState("");

  // REMOVED: editableBody, centerBlock, signBlock, metaBlock, parsed
  // These are now handled by useHtmlParser in TemplateEditorModal

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
      const res = await getAllTemplates(page, size);
      if (res?.success) {
        setTemplates(res.data || []);
        setTotal(res.total || 0);
      } else {
        console.error('Failed to fetch templates:', res?.message);
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
    console.log('📝 Opening editor for template:', tpl?.name);
    
    // CRITICAL: Reset tất cả states khi chuyển template
    setHasUnsavedChanges(false);
    setHtmlContent("");
    setFullHtml("");
    loadedTemplateIdRef.current = null; // Cho phép load lại
    
    setSelectedTemplate(tpl || null);
    setVisible(true);
  }, []);

  const closeEditor = useCallback(() => {
    setVisible(false);
    setSelectedTemplate(null);
    setHtmlContent("");
    setFullHtml("");
    setHasUnsavedChanges(false);
    loadedTemplateIdRef.current = null;
  }, []);

  // REMOVED: LOAD ONE TEMPLATE logic - TemplateEditorModal tự parse bằng useHtmlParser

  // ====== SAVE ======
  const saveTemplate = useCallback(async (getCurrentContent) => {
    if (!selectedTemplate) return { success: false, message: 'No template selected' };
    
    try {
      // Lưu toàn bộ HTML (bao gồm head + body), không chỉ body
      const finalContent = typeof getCurrentContent === 'function'
        ? getCurrentContent() // TinyMCE: trả về FULL HTML với head
        : (selectedTemplate?.contentHtml || htmlContent); // fallback

      // gọi API lưu với TOÀN BỘ HTML (bao gồm head)
      const res = await updateTemplate(
        selectedTemplate.code, 
        selectedTemplate.name,
        finalContent
      );
      
      if (res?.success) {
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
  }, [selectedTemplate, htmlContent, fetchTemplates]);

  // ====== INGEST TEMPLATE (for Modal direct load) ======
  const ingestTemplate = useCallback((tpl) => {
    console.log("===== [ingestTemplate] SIMPLIFIED =====");
    if (!tpl) return;
    
    // Đơn giản hóa - chỉ set selected template và basic states
    setSelectedTemplate(tpl);
    setHasUnsavedChanges(false);
    loadedTemplateIdRef.current = tpl.id ?? null;
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
    
    // REMOVED: rebuildCompleteHtml - dùng useHtmlParser thay thế
  };
};
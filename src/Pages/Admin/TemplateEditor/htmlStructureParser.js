// ========================================
// 🎯 HTML STRUCTURE PARSER FOR TEMPLATE EDITOR
// ========================================

// Các pattern placeholder cần bảo vệ
const PLACEHOLDER_PATTERNS = [
  /\{\{[^}]+\}\}/g,           // {{placeholder}}
  /\$\{[^}]+\}/g,             // ${placeholder}
  /%[A-Z_]+%/g,               // %PLACEHOLDER%
  /\[placeholder[^\]]*\]/gi,   // [placeholder]
  /\{\$[^}]+\}/g,             // {$placeholder}
];

/**
 * Tách HTML template thành các phần có cấu trúc
 * @param {string} html - HTML content từ BE
 * @returns {object} - Các phần được tách ra
 */
export function parseTemplateStructure(html) {
  if (!html || typeof html !== 'string') {
    console.warn('[htmlStructureParser] Invalid HTML input');
    return null;
  }

  try {
    // Tạo DOM parser
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Lấy head content (bảo toàn nguyên vẹn)
    const headElement = doc.querySelector('head');
    const head = headElement ? headElement.outerHTML : '';
    
    // Lấy body element
    const body = doc.querySelector('body');
    if (!body) {
      console.warn('[htmlStructureParser] No body element found');
      return null;
    }

    // 1. Non-editable header
    const nonEditableHeader = body.querySelector('.non-editable-header');
    const nonEditableHeaderHtml = nonEditableHeader ? nonEditableHeader.outerHTML : '';

    // 2. Meta blocks (có thể nhiều)
    const metaBlocks = Array.from(body.querySelectorAll('.meta-block'));
    const metaBlocksHtml = metaBlocks.map(block => block.outerHTML);

    // 3. Pre-section content (optional)
    const preSectionContent = body.querySelector('.pre-section-content');
    const preSectionContentHtml = preSectionContent ? preSectionContent.outerHTML : '';

    // 4. Section titles (phần có thể chỉnh sửa)
    const sectionTitles = Array.from(body.querySelectorAll('.section-title'));
    let sectionContent = '';
    
    sectionTitles.forEach(section => {
      sectionContent += section.outerHTML;
      // Lấy cả content sau section-title cho đến section-title tiếp theo hoặc sign-block
      let nextElement = section.nextElementSibling;
      while (nextElement && 
             !nextElement.classList.contains('section-title') && 
             !nextElement.classList.contains('table-block') &&
             !nextElement.classList.contains('sign-block') &&
             !nextElement.classList.contains('footer')) {
        sectionContent += nextElement.outerHTML;
        nextElement = nextElement.nextElementSibling;
      }
    });

    // 5. Table blocks (nếu có)
    const tableBlocks = Array.from(body.querySelectorAll('.table-block'));
    const tableBlocksHtml = tableBlocks.map(block => block.outerHTML);

    // 6. Sign block
    const signBlock = body.querySelector('.sign-block');
    const signBlockHtml = signBlock ? signBlock.outerHTML : '';

    // 7. Footer
    const footer = body.querySelector('.footer');
    const footerHtml = footer ? footer.outerHTML : '';

    const result = {
      head,
      nonEditableHeader: nonEditableHeaderHtml,
      metaBlocks: metaBlocksHtml,
      preSectionContent: preSectionContentHtml,
      sectionContent,
      tableBlocks: tableBlocksHtml,
      signBlock: signBlockHtml,
      footer: footerHtml
    };

    // 🔍 DETAILED LOGGING cho từng phần được tách
    console.group('📋 [TEMPLATE STRUCTURE ANALYSIS]');
    console.log('🏷️  HEAD:', {
      exists: !!head,
      length: head.length,
      preview: head ? head.substring(0, 100) + '...' : 'EMPTY'
    });
    console.log('🔒 NON-EDITABLE-HEADER:', {
      exists: !!nonEditableHeaderHtml,
      length: nonEditableHeaderHtml.length,
      preview: nonEditableHeaderHtml ? nonEditableHeaderHtml.substring(0, 100) + '...' : 'EMPTY'
    });
    console.log('📊 META-BLOCKS:', {
      count: metaBlocksHtml.length,
      totalLength: metaBlocksHtml.reduce((sum, block) => sum + block.length, 0),
      details: metaBlocksHtml.map((block, i) => ({
        index: i + 1,
        length: block.length,
        preview: block.substring(0, 50) + '...'
      }))
    });
    console.log('📝 PRE-SECTION-CONTENT:', {
      exists: !!preSectionContentHtml,
      length: preSectionContentHtml.length,
      preview: preSectionContentHtml ? preSectionContentHtml.substring(0, 100) + '...' : 'EMPTY'
    });
    console.log('✏️  SECTION-CONTENT (EDITABLE):', {
      exists: !!sectionContent,
      length: sectionContent.length,
      sectionTitleCount: sectionTitles.length,
      preview: sectionContent ? sectionContent.substring(0, 150) + '...' : 'EMPTY'
    });
    console.log('🗂️ TABLE-BLOCKS:', {
      count: tableBlocksHtml.length,
      totalLength: tableBlocksHtml.reduce((sum, block) => sum + block.length, 0),
      details: tableBlocksHtml.map((block, i) => ({
        index: i + 1,
        length: block.length,
        preview: block.substring(0, 50) + '...'
      }))
    });
    console.log('✍️  SIGN-BLOCK:', {
      exists: !!signBlockHtml,
      length: signBlockHtml.length,
      preview: signBlockHtml ? signBlockHtml.substring(0, 100) + '...' : 'EMPTY'
    });
    console.log('🦶 FOOTER:', {
      exists: !!footerHtml,
      length: footerHtml.length,
      preview: footerHtml ? footerHtml.substring(0, 100) + '...' : 'EMPTY'
    });
    console.groupEnd();

    // ✅ Validation nghiêm ngặt - KHÔNG CÓ FALLBACK
    if (!sectionContent || sectionContent.trim() === '') {
      const errorMsg = '❌ TEMPLATE STRUCTURE ERROR: Không tìm thấy section-title hoặc section content rỗng!';
      console.error(errorMsg);
      throw new Error(errorMsg);
    }

    console.log('✅ Template structure parsed successfully!');
    return result;
    
  } catch (error) {
    console.error('❌ [CRITICAL ERROR] Template parsing failed:', error.message);
    // KHÔNG FALLBACK - ném lỗi để component xử lý
    throw error;
  }
}

/**
 * Tách combinedContent thành preSectionContent và sectionContent
 * @param {string} combinedContent - Content đã được edit trong TinyMCE
 * @param {string} originalPreSectionContent - Pre-section content gốc
 * @returns {object} - {preSectionContent, sectionContent}
 */
export function splitCombinedContent(combinedContent, originalPreSectionContent) {
  if (!combinedContent) {
    return { preSectionContent: '', sectionContent: '' };
  }
  
  if (!originalPreSectionContent || !originalPreSectionContent.trim()) {
    // Nếu không có pre-section content gốc, toàn bộ là section content
    return { preSectionContent: '', sectionContent: combinedContent };
  }
  
  try {
    // Tìm vị trí kết thúc của pre-section content trong combined content
    const parser = new DOMParser();
    const originalDoc = parser.parseFromString(originalPreSectionContent, 'text/html');
    const originalPreElement = originalDoc.querySelector('.pre-section-content');
    
    if (originalPreElement) {
      const combinedDoc = parser.parseFromString(combinedContent, 'text/html');
      const preElementInCombined = combinedDoc.querySelector('.pre-section-content');
      
      if (preElementInCombined) {
        // Có pre-section content trong combined
        const preSectionContent = preElementInCombined.outerHTML;
        let sectionContent = combinedContent.replace(preSectionContent, '').trim();
        return { preSectionContent, sectionContent };
      }
    }
    
    // Fallback: coi toàn bộ là section content
    return { preSectionContent: originalPreSectionContent, sectionContent: combinedContent };
    
  } catch (error) {
    console.error('[htmlStructureParser] Split combined content error:', error);
    return { preSectionContent: originalPreSectionContent, sectionContent: combinedContent };
  }
}

/**
 * Ghép lại HTML từ các phần đã tách
 * @param {object} parts - Các phần HTML
 * @returns {string} - HTML hoàn chỉnh
 */
export function reconstructTemplateHTML(parts) {
  if (!parts || typeof parts !== 'object') {
    console.warn('[htmlStructureParser] Invalid parts input');
    return '';
  }

  try {
    const {
      head = '',
      nonEditableHeader = '',
      metaBlocks = [],
      preSectionContent = '',
      sectionContent = '',
      tableBlocks = [],
      signBlock = '',
      footer = ''
    } = parts;

    let bodyContent = '';
    
    // Ghép body content theo thứ tự
    if (nonEditableHeader) bodyContent += nonEditableHeader;
    
    // Ghép meta blocks
    if (Array.isArray(metaBlocks)) {
      metaBlocks.forEach(block => {
        if (block) bodyContent += block;
      });
    }
    
    // Ghép pre-section content nếu có
    if (preSectionContent && preSectionContent.trim()) {
      bodyContent += preSectionContent;
    }
    
    // Ghép section content (phần đã chỉnh sửa)
    if (sectionContent) bodyContent += sectionContent;
    
    // Ghép table blocks
    if (Array.isArray(tableBlocks)) {
      tableBlocks.forEach(block => {
        if (block) bodyContent += block;
      });
    }
    
    if (signBlock) bodyContent += signBlock;
    if (footer) bodyContent += footer;

    // Tạo HTML hoàn chỉnh
    const fullHTML = `<html>
${head}
<body>
${bodyContent}
</body>
</html>`;

    console.log('[htmlStructureParser] Reconstructed HTML length:', fullHTML.length);
    return fullHTML;
    
  } catch (error) {
    console.error('[htmlStructureParser] Reconstruct error:', error);
    return '';
  }
}

/**
 * Bảo vệ placeholders bằng cách thay thế thành blocks có thể xóa
 * @param {string} content - Nội dung có placeholder
 * @returns {object} - Content đã được bảo vệ và map placeholders
 */
export function protectPlaceholders(content) {
  if (!content || typeof content !== 'string') {
    return { protectedContent: content || '', placeholderMap: new Map() };
  }

  // Kiểm tra xem đã có placeholder blocks chưa để tránh double protection
  if (content.includes('class="placeholder-block"') || content.includes('data-placeholder-id')) {
    console.log('[htmlStructureParser] ⏭️ Content already has placeholder blocks, skipping protection');
    return { protectedContent: content, placeholderMap: new Map() };
  }

  // Kiểm tra xem content có quá nhiều placeholder không (có thể là loop)
  const placeholderCount = (content.match(/\{\{[^}]+\}\}/g) || []).length;
  if (placeholderCount > 50) {
    console.warn('[htmlStructureParser] ⚠️ Too many placeholders detected (possible loop), limiting protection');
    return { protectedContent: content, placeholderMap: new Map() };
  }

  let protectedContent = content;
  const placeholderMap = new Map();
  let placeholderIndex = 0;

  try {
    PLACEHOLDER_PATTERNS.forEach(pattern => {
      protectedContent = protectedContent.replace(pattern, (match) => {
        // Bỏ qua nếu match nằm trong HTML tag hoặc đã được protect
        if (match.includes('class="placeholder-block"') || match.includes('data-placeholder')) {
          return match;
        }
        
        const id = `PROTECTED_PLACEHOLDER_${placeholderIndex++}`;
        placeholderMap.set(id, match);
        
        // Thay thế bằng span KHÔNG có icon để tránh gửi về BE
        return `<span class="placeholder-block" 
                      contenteditable="false" 
                      data-placeholder="${match.replace(/"/g, '&quot;')}"
                      data-placeholder-id="${id}"
                      style="background: #e6f3ff; padding: 2px 6px; border-radius: 4px; color: #1890ff; cursor: pointer; user-select: none; display: inline-block; margin: 0 2px; border: 1px dashed #1890ff;"
                      title="Placeholder - Nhấn Delete để xóa">
                  ${match}
                </span>`;
      });
    });

    console.log('[htmlStructureParser] Protected placeholders:', placeholderMap.size);
    return { protectedContent, placeholderMap };
    
  } catch (error) {
    console.error('[htmlStructureParser] Protect placeholders error:', error);
    return { protectedContent: content, placeholderMap: new Map() };
  }
}

/**
 * Khôi phục placeholders về dạng gốc
 * @param {string} content - Content có placeholder blocks
 * @param {Map} placeholderMap - Map chứa placeholders gốc
 * @returns {string} - Content đã khôi phục placeholders
 */
export function restorePlaceholders(content, placeholderMap) {
  if (!content || typeof content !== 'string') {
    return content || '';
  }

  let restoredContent = content;
  
  try {
    // 🔄 PHASE 1: Khôi phục các placeholder blocks về dạng gốc
    if (placeholderMap && placeholderMap.size > 0) {
      placeholderMap.forEach((originalPlaceholder, id) => {
        const blockRegex = new RegExp(
          `<span class="placeholder-block"[^>]*data-placeholder-id="${id}"[^>]*>.*?</span>`,
          'g'
        );
        restoredContent = restoredContent.replace(blockRegex, originalPlaceholder);
      });
    }
    
    // 🔄 PHASE 2: Khôi phục các placeholder blocks không có ID (dựa vào data-placeholder)
    restoredContent = restoredContent.replace(
      /<span class="placeholder-block"[^>]*data-placeholder="([^"]+)"[^>]*>.*?<\/span>/g,
      (match, placeholder) => {
        // Decode HTML entities và chỉ giữ lại text gốc
        const decodedPlaceholder = placeholder
          .replace(/&quot;/g, '"')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>');
        
        // 🚫 Lọc bỏ tất cả HTML và icon, chỉ giữ text gốc
        console.log('🔄 [RESTORE] Converting block to original:', decodedPlaceholder);
        return decodedPlaceholder;
      }
    );
    
    // 🔄 PHASE 3: Xóa các placeholder blocks còn lại (không có data)
    restoredContent = restoredContent.replace(
      /<span class="placeholder-block"[^>]*>.*?<\/span>/g, 
      ''
    );

    // 🔄 PHASE 4: Làm sạch HTML entities dư thừa
    restoredContent = restoredContent.replace(/&quot;/g, '"').replace(/&amp;/g, '&');
    
    // 🔄 PHASE 5: FINAL CLEANUP - Loại bỏ tất cả icon và HTML còn sót lại
    restoredContent = restoredContent
      .replace(/🔒\s*/g, '')  // Loại bỏ icon 🔒
      .replace(/❌/g, '')          // Loại bỏ icon ❌
      .replace(/<span[^>]*>\s*<\/span>/g, '')  // Loại bỏ span rỗng
      .replace(/\s+/g, ' ')         // Chuẩn hóa khoảng trắng
      .trim();
    
    console.log('[htmlStructureParser] ✅ Restored placeholders successfully - NO ICONS');
    return restoredContent;
    
  } catch (error) {
    console.error('[htmlStructureParser] Restore placeholders error:', error);
    return content;
  }
}

/**
 * Validate cấu trúc template có đúng format không
 * @param {string} html - HTML content
 * @returns {boolean} - True nếu cấu trúc hợp lệ
 */
export function validateTemplateStructure(html) {
  if (!html || typeof html !== 'string') {
    console.warn('❌ Validation failed: Invalid HTML input');
    return false;
  }
  
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const body = doc.querySelector('body');
    
    if (!body) {
      console.warn('❌ Validation failed: No body element found');
      return false;
    }
    
    // Kiểm tra có ít nhất một section-title
    const sectionTitles = body.querySelectorAll('.section-title');
    if (sectionTitles.length === 0) {
      console.warn('❌ Validation failed: No section-title found');
      return false;
    }
    
    console.log(`✅ Validation passed: Found ${sectionTitles.length} section-title(s)`);
    return true;
    
  } catch (error) {
    console.error('❌ Validation error:', error.message);
    return false;
  }
}
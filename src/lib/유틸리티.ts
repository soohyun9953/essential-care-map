// 화면 캡처 및 클립보드 복사 등 사용자 보조 유틸리티 모듈

import html2canvas from 'html2canvas';

/**
 * 텍스트 클립보드 복사 함수 (navigator.clipboard API 활용)
 */
export async function copy_text_to_clipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback 복사 방식
      const text_area = document.createElement('textarea');
      text_area.value = text;
      text_area.style.position = 'fixed';
      text_area.style.left = '-999999px';
      text_area.style.top = '-999999px';
      document.body.appendChild(text_area);
      text_area.focus();
      text_area.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(text_area);
      return successful;
    }
  } catch (error) {
    console.error('클립보드 복사 중 오류 발생:', error);
    return false;
  }
}

/**
 * 특정 DOM 요소를 고해상도 PNG 이미지로 캡처하여 다운로드하는 함수
 */
export async function export_element_as_png(element_id: string, filename: string): Promise<boolean> {
  try {
    const target_element = document.getElementById(element_id);
    if (!target_element) {
      console.warn(`캡처 대상 요소를 찾을 수 없습니다: id = ${element_id}`);
      return false;
    }

    const canvas = await html2canvas(target_element, {
      scale: 2, // 고해상도 렌더링
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    const image_url = canvas.toDataURL('image/png');
    const download_link = document.createElement('a');
    download_link.href = image_url;
    download_link.download = filename.endsWith('.png') ? filename : `${filename}.png`;
    document.body.appendChild(download_link);
    download_link.click();
    document.body.removeChild(download_link);

    return true;
  } catch (error) {
    console.error('PNG 이미지 내보내기 중 오류 발생:', error);
    return false;
  }
}

/**
 * 숫자 세 자리 콤마 포맷터
 */
export function format_number_comma(val: number): string {
  if (isNaN(val)) return '0';
  return val.toLocaleString('ko-KR');
}

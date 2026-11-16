import { Platform, Share } from 'react-native';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { Quote, getCategory } from './data';
import { triggerHaptic } from './haptics';

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = words[0] || '';

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const width = ctx.measureText(currentLine + ' ' + word).width;
    if (width < maxWidth) {
      currentLine += ' ' + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

export async function generateQuoteCardBlobWeb(
  quote: Quote,
  bgColor?: string
): Promise<{ blob: Blob; dataUrl: string } | null> {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return null;

  const width = 1080;
  const height = 1350;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const cat = getCategory(quote.categoryId);
  const primaryColor = bgColor || cat.color || '#E2557A';

  // Background Gradient
  const grad = ctx.createLinearGradient(0, 0, width, height);
  grad.addColorStop(0, primaryColor);
  grad.addColorStop(1, '#14120F');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // Decorative border
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.lineWidth = 4;
  ctx.strokeRect(60, 60, width - 120, height - 120);

  // Corner Accents
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.lineWidth = 6;
  const cSize = 40;
  // Top Left
  ctx.beginPath();
  ctx.moveTo(60, 60 + cSize);
  ctx.lineTo(60, 60);
  ctx.lineTo(60 + cSize, 60);
  ctx.stroke();
  // Top Right
  ctx.beginPath();
  ctx.moveTo(width - 60 - cSize, 60);
  ctx.lineTo(width - 60, 60);
  ctx.lineTo(width - 60, 60 + cSize);
  ctx.stroke();
  // Bottom Left
  ctx.beginPath();
  ctx.moveTo(60, height - 60 - cSize);
  ctx.lineTo(60, height - 60);
  ctx.lineTo(60 + cSize, height - 60);
  ctx.stroke();
  // Bottom Right
  ctx.beginPath();
  ctx.moveTo(width - 60 - cSize, height - 60);
  ctx.lineTo(width - 60, height - 60);
  ctx.lineTo(width - 60, height - 60 - cSize);
  ctx.stroke();

  // Category Badge Top
  ctx.font = 'bold 34px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.textAlign = 'center';
  ctx.fillText(`• ${cat.title} •`, width / 2, 170);

  // Big Decorative Quotation Mark
  ctx.font = 'bold 160px serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.textAlign = 'center';
  ctx.fillText('”', width / 2, 380);

  // Quote Text
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '600 52px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'center';

  const maxTextWidth = width - 260;
  const lines = wrapText(ctx, quote.text, maxTextWidth);
  const lineHeight = 86;
  const totalTextHeight = lines.length * lineHeight;
  let startY = 490 + (height - 850 - totalTextHeight) / 2;
  if (startY < 420) startY = 420;

  for (let i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i], width / 2, startY + i * lineHeight);
  }

  // Author
  if (quote.author) {
    ctx.font = 'italic 38px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.fillText(`— ${quote.author}`, width / 2, startY + lines.length * lineHeight + 60);
  }

  // Footer divider & Brand
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(width / 2 - 120, height - 190);
  ctx.lineTo(width / 2 + 120, height - 190);
  ctx.stroke();

  ctx.font = 'bold 38px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText('مَـعْـنَـايْ • MAANAY', width / 2, height - 130);

  ctx.font = '400 24px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.fillText('كلام عندو معنى وخلاصة الأيام', width / 2, height - 90);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve({ blob, dataUrl: canvas.toDataURL('image/png') });
      } else {
        resolve(null);
      }
    }, 'image/png');
  });
}

function generateSvgContent(quote: Quote, bgColor?: string): string {
  const cat = getCategory(quote.categoryId);
  const primaryColor = bgColor || cat.color || '#E2557A';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1350" viewBox="0 0 1080 1350">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${primaryColor}" />
        <stop offset="100%" stop-color="#14120F" />
      </linearGradient>
    </defs>
    <rect width="1080" height="1350" fill="url(#bg)" />
    <rect x="60" y="60" width="960" height="1230" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="4" />
    <text x="540" y="170" fill="rgba(255,255,255,0.85)" font-size="34" font-weight="bold" text-anchor="middle" direction="rtl">• ${cat.title} •</text>
    <text x="540" y="380" fill="rgba(255,255,255,0.2)" font-size="160" font-weight="bold" text-anchor="middle">”</text>
    <foreignObject x="120" y="420" width="840" height="580">
      <div xmlns="http://www.w3.org/1999/xhtml" style="color: #fff; font-size: 48px; line-height: 1.6; text-align: center; direction: rtl; font-family: system-ui, sans-serif; font-weight: 600; display: flex; flex-direction: column; justify-content: center; height: 100%;">
        <div>“${quote.text}”</div>
        ${quote.author ? `<div style="font-size: 34px; margin-top: 30px; opacity: 0.85; font-style: italic;">— ${quote.author}</div>` : ''}
      </div>
    </foreignObject>
    <line x1="420" y1="1160" x2="660" y2="1160" stroke="rgba(255,255,255,0.2)" stroke-width="2" />
    <text x="540" y="1220" fill="#ffffff" font-size="38" font-weight="bold" text-anchor="middle">مَـعْـنَـايْ • MAANAY</text>
    <text x="540" y="1260" fill="rgba(255,255,255,0.6)" font-size="24" text-anchor="middle">كلام عندو معنى وخلاصة الأيام</text>
  </svg>`;
}

export async function exportQuoteImage(
  quote: Quote,
  bgColor?: string
): Promise<{ success: boolean; message: string }> {
  triggerHaptic('medium');

  if (Platform.OS === 'web') {
    try {
      const res = await generateQuoteCardBlobWeb(quote, bgColor);
      if (!res) throw new Error('Canvas not supported');

      const file = new File([res.blob], `maanay-${quote.id}.png`, { type: 'image/png' });
      const nav: any = typeof navigator !== 'undefined' ? navigator : null;

      if (nav?.canShare && nav.canShare({ files: [file] })) {
        await nav.share({
          files: [file],
          title: 'معناي',
          text: quote.text,
        });
        return { success: true, message: 'تم فتح نافذة المشاركة' };
      }

      // Fallback: Download the image directly
      const a = document.createElement('a');
      a.href = res.dataUrl;
      a.download = `maanay-${quote.id}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return { success: true, message: 'تم تحميل صورة البطاقة 🖼️' };
    } catch {
      return { success: false, message: 'تعذر إنشاء الصورة' };
    }
  }

  // Native (iOS / Android)
  try {
    const svg = generateSvgContent(quote, bgColor);
    const filename = `${FileSystem.cacheDirectory}maanay-${quote.id}.svg`;
    await FileSystem.writeAsStringAsync(filename, svg, { encoding: FileSystem.EncodingType.UTF8 });

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(filename, { mimeType: 'image/svg+xml', dialogTitle: 'مشاركة بطاقة معناي' });
      return { success: true, message: 'تمت مشاركة البطاقة' };
    } else {
      await Share.share({ message: quote.author ? `${quote.text}\n— ${quote.author}` : quote.text });
      return { success: true, message: 'تمت المشاركة' };
    }
  } catch {
    return { success: false, message: 'تعذر مشاركة البطاقة' };
  }
}


'use client';

import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';

// 실제 배포된 Production 주소
const BASE_URL = 'https://valleybreakfast.vercel.app';

// 테이블 목록
const TABLES = [
  'A1', 'A2', 'A3',
  'B1', 'B2', 'B3',
  'C1', 'C2', 'C3',
  'D1', 'D2', 'D3',
  'T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'
];

export default function QRGeneratorPage() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // SVG를 PNG 이미지로 전환하여 개별 다운로드
  const downloadQR = (tableNum: string) => {
    const svgElement = document.getElementById(`qr-svg-${tableNum}`);
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      if (ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      }
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `QR_Table_${tableNum}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-8 print:p-0 print:bg-white">
      {/* 상단 제어 바 (인쇄 시 숨김) */}
      <div className="max-w-4xl mx-auto mb-8 flex justify-between items-center print:hidden bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div>
          <h1 className="text-xl font-bold text-gray-800">테이블별 QR 코드 출력 및 다운로드</h1>
          <p className="text-sm text-gray-500 mt-1">
            연동 주소: <span className="font-mono text-blue-600">{BASE_URL}</span>
          </p>
        </div>
        <button
          onClick={() => window.print()}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-lg shadow-sm transition-colors flex items-center gap-2"
        >
          🖨️ 전체 인쇄 (PDF 저장)
        </button>
      </div>

      {/* QR 코드 카드 그리드 */}
      <div className="max-w-4xl mx-auto grid grid-cols-2 gap-6 print:grid-cols-2 print:gap-6 print:max-w-none">
        {TABLES.map((table) => {
          const targetUrl = `${BASE_URL}/order?table=${table}`;

          return (
            <div
              key={table}
              className="bg-white border-2 border-gray-300 rounded-2xl p-6 text-center flex flex-col items-center justify-between shadow-sm qr-card print:shadow-none print:p-5"
            >
              <div className="w-full text-center border-b pb-3 mb-4">
                <span className="text-xs uppercase tracking-widest text-gray-400 font-semibold">Breakfast Service</span>
                <h2 className="text-2xl font-black text-gray-800 mt-1">테이블 {table}번</h2>
              </div>

              {/* QR 코드 SVG 영역 */}
              <div className="p-4 bg-white rounded-xl border border-gray-100 shadow-inner my-2">
                <QRCodeSVG
                  id={`qr-svg-${table}`}
                  value={targetUrl}
                  size={160}
                  level="H"
                  includeMargin={true}
                />
              </div>

              <div className="mt-2 text-center w-full">
                <p className="text-sm font-semibold text-gray-700">카메라로 스캔하여 주문해 주세요</p>
                <p className="text-xs text-gray-400 font-mono mt-1 print:text-[10px]">{targetUrl}</p>
                
                {/* 개별 PNG 다운로드 버튼 (인쇄 시 숨김) */}
                <button
                  onClick={() => downloadQR(table)}
                  className="mt-3 w-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold py-2 rounded-lg transition-colors print:hidden"
                >
                  💾 PNG 이미지 저장
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 10mm;
          }
          body {
            background: white !important;
            -webkit-print-color-adjust: exact;
          }
          .qr-card {
            break-inside: avoid;
            page-break-inside: avoid;
          }
        }
      `}</style>
    </div>
  );
}

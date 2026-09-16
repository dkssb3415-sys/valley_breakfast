'use client';

import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';

// 실제 배포된 Production 주소 설정
const BASE_URL = 'https://valleybreakfast.vercel.app';

// 테이블 목록 (각각의 테이블 번호가 개별 항목으로 구분됨)
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

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-8 print:p-0 print:bg-white">
      {/* 인쇄 시 숨겨지는 상단 제어 바 */}
      <div className="max-w-4xl mx-auto mb-8 flex justify-between items-center print:hidden bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div>
          <h1 className="text-xl font-bold text-gray-800">테이블별 QR 코드 인쇄 출력</h1>
          <p className="text-sm text-gray-500 mt-1">
            배포 주소: <span className="font-mono text-blue-600">{BASE_URL}</span>
          </p>
        </div>
        <button
          onClick={() => window.print()}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-lg shadow-sm transition-colors flex items-center gap-2"
        >
          🖨️ PDF로 저장 / 인쇄
        </button>
      </div>

      {/* QR 코드 그리드 레이아웃 (테이블별 개별 카드 생성) */}
      <div className="max-w-4xl mx-auto grid grid-cols-2 gap-6 print:grid-cols-2 print:gap-4 print:max-w-none">
        {TABLES.map((table) => {
          const targetUrl = `${BASE_URL}/order?table=${table}`;

          return (
            <div
              key={table}
              className="bg-white border-2 border-gray-200 rounded-2xl p-6 text-center flex flex-col items-center justify-between shadow-sm page-break-inside-avoid print:shadow-none print:border-gray-300 print:mb-4"
            >
              <div className="w-full text-center border-b pb-3 mb-4">
                <span className="text-xs uppercase tracking-widest text-gray-400 font-semibold">Breakfast Service</span>
                <h2 className="text-2xl font-black text-gray-800 mt-1">테이블 {table}번</h2>
              </div>

              {/* QR 코드 생성 영역 */}
              <div className="p-4 bg-white rounded-xl border border-gray-100 shadow-inner my-2">
                <QRCodeSVG
                  value={targetUrl}
                  size={160}
                  level="H"
                  includeMargin={true}
                />
              </div>

              <div className="mt-4 text-center">
                <p className="text-sm font-semibold text-gray-700">카메라로 스캔하여 주문해 주세요</p>
                <p className="text-xs text-gray-400 font-mono mt-1 print:text-[10px]">{targetUrl}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* 인쇄 스타일 제어 */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 15mm;
          }
          body {
            background: white !important;
          }
          .page-break-inside-avoid {
            break-inside: avoid;
          }
        }
      `}</style>
    </div>
  );
}

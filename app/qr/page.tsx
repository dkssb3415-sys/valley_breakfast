'use client';

import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';

export default function QRPage() {
  const [baseUrl, setBaseUrl] = useState('');
  const [tableCount, setTableCount] = useState(10); // 기본 생성 테이블 수 (1~10번)
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // 현재 접속 중인 도메인(예: https://valleybreakfast.vercel.app)을 자동으로 가져옵니다.
    setBaseUrl(window.location.origin);
  }, []);

  if (!isMounted) return null;

  // 테이블 번호 배열 생성 (예: A1, A2, A3 ... 또는 1, 2, 3 ...)
  // 여기서는 깔끔하게 "A1", "A2", "A3"... 형태로 테이블 번호를 만듭니다.
  const tables = Array.from({ length: tableCount }, (_, i) => `A${i + 1}`);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-5xl mx-auto">
        {/* 상단 컨트롤 영역 (인쇄 시 숨겨짐) */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 mb-8 flex flex-col sm:flex-row justify-between items-center gap-4 print:hidden">
          <div>
            <h1 className="text-2xl font-black text-gray-800 flex items-center gap-2">
              🖨️ 테이블 QR 코드 인쇄 템플릿
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              각 테이블에 부착할 QR 코드 주문 페이지를 인쇄하세요.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-bold text-gray-700">생성 테이블 수:</label>
              <input
                type="number"
                min="1"
                max="30"
                value={tableCount}
                onChange={(e) => setTableCount(Number(e.target.value))}
                className="w-20 border border-gray-300 rounded-lg px-3 py-1.5 text-center font-bold text-gray-800"
              />
            </div>
            <button
              onClick={handlePrint}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl shadow-md transition-colors text-sm"
            >
              🖨️ 인쇄하기
            </button>
          </div>
        </div>

        {/* QR 코드 그리드 영역 (A4 인쇄 최적화 스타일) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 print:grid-cols-2 print:gap-4">
          {tables.map((tableNum) => {
            const orderUrl = `${baseUrl}/order?table=${tableNum}`;
            return (
              <div
                key={tableNum}
                className="bg-white border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center flex flex-col items-center justify-between shadow-sm print:border-solid print:border-gray-800 print:shadow-none print:p-4"
              >
                <div className="mb-3">
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full print:bg-gray-100 print:text-black">
                    Valley Breakfast
                  </span>
                  <h2 className="text-2xl font-black text-gray-900 mt-2">
                    {tableNum}번 테이블
                  </h2>
                </div>

                {/* QR 코드 생성 */}
                <div className="bg-white p-3 rounded-xl border border-gray-100 my-2 shadow-inner">
                  <QRCodeSVG value={orderUrl} size={160} level="H" includeMargin={true} />
                </div>

                <div className="mt-3">
                  <p className="text-xs font-medium text-gray-500 mb-1">
                    스마트폰 카메라로 스캔하세요
                  </p>
                  <span className="text-[11px] text-gray-400 break-all font-mono">
                    {orderUrl}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

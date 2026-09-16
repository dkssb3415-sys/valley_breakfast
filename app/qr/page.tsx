'use client';

import { useState, useEffect } from 'react';

export default function QRGeneratorPage() {
  const [tableInput, setTableInput] = useState<string>(
    'A1,A2,A3,B1,B2,B3,C1,C2,C3,D1,D2,D3,T1,T2,T3,T4,T5,T6,T7'
  );
  const [baseUrl, setBaseUrl] = useState<string>('');

  useEffect(() => {
    setBaseUrl(window.location.origin);
  }, []);

  const tableList = tableInput
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <div className="no-print" style={{ marginBottom: '30px', padding: '20px', background: '#f5f5f5', borderRadius: '8px' }}>
        <h1>📱 테이블 QR 코드 생성기</h1>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '15px' }}>
          <label style={{ display: 'flex', alignItems: 'center' }}>
            <b style={{ width: '160px' }}>서버 IP / 도메인:</b>
            <input
              type="text"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              style={{ padding: '8px', width: '350px' }}
            />
          </label>

          <label style={{ display: 'flex', alignItems: 'flex-start' }}>
            <b style={{ width: '160px', marginTop: '8px' }}>테이블 번호 목록:</b>
            <textarea
              value={tableInput}
              onChange={(e) => setTableInput(e.target.value)}
              rows={3}
              style={{ padding: '8px', width: '500px', fontSize: '14px' }}
            />
          </label>
        </div>

        <button
          onClick={handlePrint}
          style={{ padding: '10px 20px', fontSize: '16px', backgroundColor: '#0070f3', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
        >
          🖨️ QR 코드 인쇄 / PDF 저장
        </button>
      </div>

      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white; }
        }
      `}</style>

      {/* QR 카드 목록 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
        {tableList.map((tableNo, idx) => {
          const targetUrl = `${baseUrl}/order?table=${encodeURIComponent(tableNo)}`;
          // 외부 렌더링 API 사용 (라이브러리 설치 필요 없음)
          const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(targetUrl)}`;

          return (
            <div
              key={idx}
              style={{
                border: '2px solid #333',
                borderRadius: '12px',
                padding: '20px',
                textAlign: 'center',
                backgroundColor: '#fff',
                pageBreakInside: 'avoid',
              }}
            >
              <h2 style={{ margin: '0 0 10px 0', fontSize: '22px' }}>테이블 {tableNo}</h2>
              <div style={{ padding: '10px', background: '#fff', border: '1px solid #ddd', display: 'inline-block' }}>
                <img src={qrImageUrl} alt={`QR Code ${tableNo}`} width="150" height="150" />
              </div>
              <p style={{ margin: '10px 0 0 0', fontSize: '12px', color: '#666', wordBreak: 'break-all' }}>
                {targetUrl}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

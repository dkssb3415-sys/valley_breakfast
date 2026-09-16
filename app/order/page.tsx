'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface Order {
  id: number;
  table_no: string;
  menu: string;
  status: string;
  created_at: string;
}

function OrderContent() {
  const searchParams = useSearchParams();
  const tableNo = searchParams.get('table') || '1';
  const [selectedMenu, setSelectedMenu] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [myOrders, setMyOrders] = useState<Order[]>([]);

  // 내 테이블의 주문 내역 가져오기
  const fetchMyOrders = async () => {
    const { data } = await supabase
      .from('orders')
      .select('*')
      .eq('table_no', tableNo)
      .order('created_at', { ascending: false });

    if (data) {
      setMyOrders(data);
    }
  };

  useEffect(() => {
    fetchMyOrders();

    // 실시간 구독 (주방에서 상태 바꾸면 즉시 변경)
    const channel = supabase
      .channel('customer-orders')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => {
          fetchMyOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tableNo]);

  // 주문 전송
  const handleOrder = async () => {
    if (!selectedMenu) {
      alert('메뉴를 선택해 주세요.');
      return;
    }

    setLoading(true);

    const { error } = await supabase.from('orders').insert([
      {
        table_no: tableNo,
        menu: selectedMenu,
        status: '접수',
      },
    ]);

    setLoading(false);

    if (error) {
      alert('주문 실패: ' + error.message);
    } else {
      setSelectedMenu('');
      alert('주문이 접수되었습니다!');
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h1 style={{ borderBottom: '2px solid #333', paddingBottom: '10px' }}>🍽️ 조식 뷔페 주문</h1>
      <p><b>테이블 번호:</b> {tableNo}번</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', margin: '20px 0' }}>
        <h3>메뉴 선택</h3>
        {['치즈 오믈렛', '라이브 쌀국수', '팬케이크'].map((menu) => (
          <button
            key={menu}
            onClick={() => setSelectedMenu(menu)}
            style={{
              padding: '12px',
              fontSize: '16px',
              backgroundColor: selectedMenu === menu ? '#0070f3' : '#f0f0f0',
              color: selectedMenu === menu ? '#fff' : '#000',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            {menu}
          </button>
        ))}
      </div>

      <button
        onClick={handleOrder}
        disabled={loading}
        style={{
          width: '100%',
          padding: '15px',
          fontSize: '18px',
          backgroundColor: loading ? '#ccc' : '#28a745',
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          cursor: loading ? 'not-allowed' : 'pointer',
        }}
      >
        {loading ? '전송 중...' : '주문 전송하기'}
      </button>

      {/* 내 주문 현황 (실시간 연동) */}
      <div style={{ marginTop: '30px', borderTop: '1px solid #ddd', paddingTop: '20px' }}>
        <h3>📋 내 주문 현황</h3>
        {myOrders.length === 0 ? (
          <p style={{ color: '#888' }}>주문 내역이 없습니다.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {myOrders.map((order) => (
              <div
                key={order.id}
                style={{
                  padding: '12px',
                  borderRadius: '8px',
                  backgroundColor: '#f9f9f9',
                  border: '1px solid #eee',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <b>{order.menu}</b>
                </div>
                <span
                  style={{
                    padding: '4px 10px',
                    borderRadius: '12px',
                    fontSize: '13px',
                    fontWeight: 'bold',
                    color: '#fff',
                    backgroundColor:
                      order.status === '조리중'
                        ? '#faad14'
                        : order.status === '조리완료'
                        ? '#52c41a'
                        : '#1890ff',
                  }}
                >
                  {order.status === '조리완료' ? '🎉 조리완료' : order.status === '조리중' ? '🔥 조리중' : '📥 접수됨'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function OrderPage() {
  return (
    <Suspense fallback={<div>로딩 중...</div>}>
      <OrderContent />
    </Suspense>
  );
}

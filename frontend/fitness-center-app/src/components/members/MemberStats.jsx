import React from 'react';
import Card from '../common/Card';
import { PieChart, Pie, Cell, Legend, ResponsiveContainer, Tooltip } from 'recharts';

const MemberStats = ({ stats }) => {
  const defaultStats = {
    totalMembers: 0,
    activeMembers: 0,
    inactiveMembers: 0,
    holdMembers: 0,
    newMembersThisMonth: 0,
    averageAttendance: 0
  };
  
  const { 
    totalMembers, 
    activeMembers, 
    inactiveMembers, 
    holdMembers,
    newMembersThisMonth, 
    averageAttendance 
  } = { ...defaultStats, ...stats };
  
  // Data for pie chart
  const statusData = [
    { name: 'Active', value: activeMembers, color: '#4CAF50' },
    { name: 'Inactive', value: inactiveMembers, color: '#F44336' },
    { name: 'On Hold', value: holdMembers, color: '#FF9800' }
  ];
  
  // Filter out zero values to avoid empty segments in the chart
  const filteredStatusData = statusData.filter(item => item.value > 0);
  
  // Renk kontrastına göre metin rengini belirleyen geliştirilmiş fonksiyon
  const getContrastColor = (hexColor) => {
    // Her dilim rengi için sabit metin rengi tanımlayalım
    const colorMap = {
      '#4CAF50': '#000000', // Yeşil (Active) için beyaz metin
      '#F44336': '#000000', // Kırmızı (Inactive) için siyah metin
      '#FF9800': '#000000'  // Turuncu (On Hold) için siyah metin
    };
    
    // Eğer renk haritamızda varsa, o rengi döndür
    if (colorMap[hexColor]) {
      return colorMap[hexColor];
    }
    
    // Haritada olmayan renkler için eskiden olduğu gibi kontrast hesaplama yap
    // Hex rengi RGB'ye çevirme
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);
    
    // Parlaklık hesaplama (YIQ formülü)
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    
    // 150'den büyükse koyu renk, değilse açık renk döndür
    return (yiq >= 150) ? '#000000' : '#FFFFFF';
  };
  
  // Etiketleri dilim rengine göre değişen renkte gösteren özel render fonksiyonu
  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, value, name, index }) => {
    // Eğer değer çok küçükse, etiket görüntülemeyelim
    if (percent < 0.05) return null;
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.7; // Biraz daha dışarı çıkarttım
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
    // Dilimin rengine göre kontrast metin rengi seçimi
    const color = statusData[index]?.color;
    const textColor = color ? getContrastColor(color) : '#FFFFFF';
    
    // Metin içeriği
    const text = `${name}: ${value} (${(percent * 100).toFixed(0)}%)`;
    
    return (
      <text 
        x={x}
        y={y}
        fill={textColor}
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize={11}
        fontWeight="bold"
        // Daha iyi okunabilirlik için hafif gölge ekleyelim
        style={{
          textShadow: textColor === '#FFFFFF' ? '1px 1px 1px rgba(0,0,0,0.5)' : '1px 1px 1px rgba(255,255,255,0.5)'
        }}
      >
        {text}
      </text>
    );
  };

  return (
    <Card title="Member Statistics">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Member Status Distribution Chart */}
        <div className="md:col-span-2 bg-gray-50 p-3 rounded-lg">
          <h4 className="text-sm font-medium text-gray-500 mb-2">Member Status Distribution</h4>
          <div className="h-64">
            {totalMembers > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={filteredStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    labelLine={false}
                    label={renderCustomLabel}
                  >
                    {filteredStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value, name) => [`${value} members (${((value / totalMembers) * 100).toFixed(1)}%)`, name]}
                    contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '4px', padding: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}
                  />
                  <Legend 
                    formatter={(value, entry) => {
                      const { payload } = entry;
                      return `${value}: ${payload.value} members`;
                    }}
                    verticalAlign="bottom"
                    height={36}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-gray-400">No member data available</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Key Metrics */}
        <div className="flex flex-col space-y-4">
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-gray-500 text-sm">Total Members</p>
            <p className="text-xl font-bold">{totalMembers}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-gray-500 text-sm">New This Month</p>
            <p className="text-xl font-bold">{newMembersThisMonth}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-gray-500 text-sm">Avg. Attendance</p>
            <p className="text-xl font-bold">{averageAttendance}/week</p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default MemberStats;
import React from "react";

export default function About() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-pink-100 via-blue-100 to-purple-100 py-12">
      <div className="relative max-w-2xl w-full mx-auto p-8 bg-[#ffe066] border-2 border-dashed border-yellow-400 rounded-[2.5rem] shadow-xl">
        {/* 信封蜡印装饰 */}
        <div className="absolute -top-7 -left-7 select-none pointer-events-none z-10">
          {/* 红色蜡印SVG */}
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="24" cy="24" r="18" fill="#c1121f" stroke="#a10d1a" strokeWidth="4" />
            <text x="24" y="30" textAnchor="middle" fontSize="18" fill="#fff" fontWeight="bold">✦</text>
          </svg>
        </div>
        {/* 信封邮筒装饰 */}
        <div className="absolute -bottom-6 -right-6 text-3xl select-none pointer-events-none">📮</div>
        <div className="flex flex-col items-center mb-6">
          <span className="text-5xl mb-2 animate-bounce" role="img" aria-label="planet">🪐</span>
          <h1 className="text-4xl font-extrabold text-pink-500 drop-shadow-sm mb-1">关于我们 · RWA星球</h1>
          <span className="text-base text-gray-500">现实世界资产 × 区块链 × 共创社区</span>
        </div>
        <div className="space-y-4 text-lg text-gray-700 leading-relaxed">
          <p>
            <span className="inline-block mr-2 text-2xl" role="img" aria-label="friends">👫</span>
            <strong>RWA星球</strong>，是一个对区块链与金融充满好奇心的个人发起的学习与共创社区。我很希望把它打造成一个探索真实世界资产（RWA）与区块链融合的开放场域。
          </p>
          <p>
            <span className="inline-block mr-2 text-2xl" role="img" aria-label="lightbulb">💡</span>
            我始终相信，在这个数字文明加速演进的时代，真正有价值的探索，往往起始于一群人对新世界的共同好奇。
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>📚 获取最新资讯与学习材料，深入理解RWA的底层逻辑；</li>
            <li>📝 提交商业模式设计、案例研究、项目设想，与大家一起激荡想法；</li>
            <li>💬 加入讨论区和推演小组，参与真实项目的演进过程。</li>
          </ul>
          <p>
            <span className="inline-block mr-2 text-2xl" role="img" aria-label="seedling">🌱</span>
            🌱 平台期待、鼓励有潜力的想法在这里生根发芽，当具备落地条件时，平台将汇聚多方资源，共同推进。
            <br />
          </p>
          <p>
            <span className="inline-block mr-2 text-2xl" role="img" aria-label="no-leader">🧑‍🚀</span>
            这里没有"主导者"，只有共同探索者。RWA星球希望成为一个由参与者共建共识、共享成果的社区星球。
          </p>
          <p>
            <span className="inline-block mr-2 text-2xl" role="img" aria-label="welcome">🤗</span>
            热烈欢迎每一位愿意以知识与好奇参与构建未来资产新世界的你，<br />
            在这里，把学习变成生产力，把共识变成连接，把机会变成结果。
          </p>
        </div>
        <div className="flex justify-center mt-8 space-x-4">
          <span className="text-3xl animate-spin-slow" role="img" aria-label="planet">🪐</span>
          <span className="text-3xl animate-bounce" role="img" aria-label="sparkles">✨</span>
          <span className="text-3xl animate-pulse" role="img" aria-label="star">🌟</span>
          <span className="text-3xl animate-wiggle" role="img" aria-label="heart">💖</span>
        </div>
        <style>{`
          @keyframes spin-slow { 0% { transform: rotate(0deg);} 100% { transform: rotate(360deg);} }
          .animate-spin-slow { animation: spin-slow 6s linear infinite; }
          @keyframes wiggle { 0%, 100% { transform: rotate(-8deg);} 50% { transform: rotate(8deg);} }
          .animate-wiggle { animation: wiggle 1.2s ease-in-out infinite; }
        `}</style>
      </div>
    </div>
  );
} 

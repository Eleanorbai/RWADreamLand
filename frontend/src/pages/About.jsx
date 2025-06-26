import React from "react";

export default function About() {
  return (
    <div className="max-w-2xl mx-auto mt-16 p-8 bg-white rounded shadow text-gray-800">
      <div className="flex items-center justify-center mb-6">
        <span className="text-4xl mr-2" role="img" aria-label="sparkles">✨</span>
        <h1 className="text-3xl font-bold text-pink-500">关于我们</h1>
        <span className="text-4xl ml-2" role="img" aria-label="books">📚</span>
      </div>
      <p className="mb-4">
        <strong>RWA公社</strong>，是一个由通商数据成员发起、面向真实项目场景的 RWA 学习与共创平台。
      </p>
      <p className="mb-4">
        我们相信，未来的产业升级与金融创新，将越来越依赖于真实世界资产（RWA）与区块链等技术的深度融合。<br/>
        但比技术更重要的，是对场景的理解力、模型的设计力和资源的整合力。<br/>
        这正是我们创建这个平台的初衷。
      </p>
      <p className="mb-4">
        所以，我们关注真实世界资产（RWA）如何通过区块链机制实现数字化落地，也关注人才如何通过学习、贡献与协作获得实际参与机会。
      </p>  
      <p className="mb-4">
        在这里，每一位成员不仅是学习者，更是共建者。<br/>
        你可以围绕 RWA 项目提交可行的商业模式设计、行业研究、案例材料；也可以参与到实际项目的推演、研讨与共创中。<br/>
        通过链上积分机制，我们记录每一次贡献，让价值透明、可衡量、可积累。
      </p>
      <p className="mb-4">
        所有被认证通过的有效材料，都将获得由通商数据授予的链上积分，作为参与项目优先权的重要凭证。<br/>
        积分将成为通往真实RWA落地机会的门票——你不只是来学习，你也可以成为未来项目的一部分。
      </p>
      <blockquote className="border-l-4 border-pink-400 pl-4 italic text-pink-600 mb-4 bg-pink-50">
        "从材料贡献者，到方案设计者，最终成为RWA项目的参与者。"
      </blockquote>
      <p className="mb-4">
        这是社区希望与你共同完成的成长闭环。
      </p>
      <p className="mb-4">
        平台由社区成员共同维护，由通商数据提供生态资源支持。<br/>
        我们诚邀每一位具备专业知识与实践热情的伙伴，共同探索真实世界资产的创新路径。
      </p>
      <div className="flex justify-center mt-8">
        <span className="text-3xl mx-2" role="img" aria-label="rocket">🚀</span>
        <span className="text-3xl mx-2" role="img" aria-label="star">🌟</span>
        <span className="text-3xl mx-2" role="img" aria-label="handshake">🤝</span>
      </div>
    </div>
  );
} 

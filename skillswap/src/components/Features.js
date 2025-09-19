import React from 'react';

export default function Features() {
  const features = [
    {
      icon: "🎯",
      title: "Skill Sharing",
      description: "Share your expertise and help others learn new skills in your field."
    },
    {
      icon: "🔍",
      title: "Skill Discovery",
      description: "Find people with the skills you need and connect with them directly."
    },
    {
      icon: "🤝",
      title: "Collaboration",
      description: "Build meaningful connections and collaborate on projects together."
    },
    {
      icon: "📈",
      title: "Growth",
      description: "Expand your network and grow your skills through community interaction."
    },
    {
      icon: "⚡",
      title: "Real-time",
      description: "Get instant updates when new skills are shared or opportunities arise."
    },
    {
      icon: "🔒",
      title: "Secure",
      description: "Your data is protected with enterprise-grade security and privacy."
    }
  ];

  return (
    <div className="py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Why Choose SkillSwap?
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Join thousands of professionals who are already sharing skills and building connections.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

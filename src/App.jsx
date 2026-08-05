import React from 'react'
import OrgChart from './pages/OrgChart'
import PromptModal from './components/PromptModal'
import { useStore } from './store/useStore'

export default function App() {
  const promptConfig = useStore(s => s.promptConfig)

  return (
    <>
      {/* Liquid background effect */}
      <div className="liquid-wrapper">
        <div className="liquid-orb orb-1"></div>
        <div className="liquid-orb orb-2"></div>
        <div className="liquid-orb orb-3"></div>
        <div className="liquid-orb orb-4"></div>
      </div>
      
      <div className="grid-bg"></div>
      
      <div className="page-wrapper">
        <OrgChart />
      </div>

      {promptConfig && (
        <PromptModal
          title={promptConfig.title}
          description={promptConfig.description}
          placeholder={promptConfig.placeholder}
          onConfirm={promptConfig.onConfirm}
          onCancel={promptConfig.onCancel}
        />
      )}
    </>
  )
}

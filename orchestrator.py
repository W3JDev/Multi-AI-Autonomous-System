# 💎 Multi-AI Autonomous System Orchestrator
# ⚚ Orchestrates 8 specialized AI agents with multi-model strategy

import os
import json
import requests
from datetime import datetime
import sys

# Import all agents
from agents.ai_integration_specialist import AIIntegrationSpecialist
from agents.frontend_master import FrontendMaster
from agents.backend_architect import BackendArchitect
from agents.documentation_writer import DocumentationWriter
from agents.deployment_master import DeploymentMaster
from agents.quality_guardian import QualityGuardian
from agents.gas_automation import GASAutomation
from agents.revenue_optimizer import RevenueOptimizer

class MultiAIOrchestrator:
    """
    ⚚ Master Orchestrator for Multi-AI Autonomous System

    Manages 8 specialized AI agents with multi-model strategy:
    - Gemini: Creative & Strategic Tasks
    - DeepSeek: Coding & Analysis
    - GitHub Models: Repository Management
    """

    def __init__(self):
        self.name = "Multi-AI Orchestrator 💎"
        self.total_repos_count = 130
        self.available_models = ["gemini", "deepseek", "github-models"]

        # Initialize all 8 agents
        self.agents = {
            "ai_integration": AIIntegrationSpecialist(),
            "frontend": FrontendMaster(),
            "backend": BackendArchitect(),
            "documentation": DocumentationWriter(),
            "deployment": DeploymentMaster(),
            "quality": QualityGuardian(),
            "gas_automation": GASAutomation(),
            "revenue": RevenueOptimizer()
        }

    def display_system_status(self):
        """Displays system status and agent information"""
        print(f"== {self.name} Status ==")
        print(f"Total Repositories Managed: {self.total_repos_count}")
        print(f"Available AI Models: {', '.join(self.available_models)}")
        print(f"Active Agents: {len(self.agents)}")
        print("")

        for agent_id, agent in self.agents.items():
            status = agent.autonomous_operation()
            print(f"💎 {status['agent']} (Managing {status['managed_repos']} repos)")
            print(f"   • Primary AI: {status['primary_ai']} | Secondary AI: {status['secondary_ai']}")
            if 'specializations' in status:
                print(f"   • Specializations: {', '.join(status['specializations'])}")
            print()

    def run_autonomous_cycle(self):
        """Run full autonomous operation cycle"""
        print(f"💎 === AUTONOMOUS CYCLE START! === 💎")

        results = []
        for agent_id, agent in self.agents.items():
            try:
                status = agent.autonomous_operation()
                results.append(status)
                print(f"✅ {status['agent']} activated successfully")
            except Exception as e:
                print(f"❌ Error in {agent_id}: {e}")

        print(f"🔥 === ALL AGENTS ACTIVATED! === 🔥")
        return results

    def get_system_summary(self):
        """Gets an overview of the entire system"""
        return {
            "orchestrator": self.name,
            "total_repositories": self.total_repos_count,
            "available_ai_models": self.available_models,
            "agent_count": len(self.agents),
            "agent_list": list(self.agents.keys()),
            "status_time": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }

if __name__ == "__main__":
    orchestrator = MultiAIOrchestrator()

    # Display system status
    orchestrator.display_system_status()

    # Run autonomous cycle
    autonomous_results = orchestrator.run_autonomous_cycle()

    # Display system summary
    system_summary = orchestrator.get_system_summary()
    print(f"\n🤩 AUTONOMOUS SYSTEM SUMMARY 🤩")
    print(json.dumps(system_summary, indent=2))

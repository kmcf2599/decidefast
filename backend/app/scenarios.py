from typing import List, Dict, Any

SCENARIOS: List[Dict[str, Any]] = [
    {
        "id": "pricing_deadlock",
        "title": "The Enterprise Pricing Deadlock",
        "description": "Middle management debates raising enterprise pricing vs. 'taking it offline' for the 4th consecutive week.",
        "topic": "Q3 Enterprise Tier Pricing & Grandfathering Strategy",
        "context_documents": [
            {
                "id": "doc_deck_q3",
                "title": "Q3 Board Deck - Executive Summary (Slide 4)",
                "content": (
                    "Board Mandate: Q3 Gross Margin Target is 80%. Enterprise Tier COGS increased by $140/account "
                    "due to dedicated VPC and SOC-2 infrastructure costs. The unit economics study conducted in August "
                    "concluded that $899/month maintains target 82% margin. Grandfathering existing customers for 12 months "
                    "protects zero-churn SLA. Board approved moving forward immediately in Sept."
                )
            },
            {
                "id": "doc_sales_survey",
                "title": "August Enterprise Pilot Feedback Memo",
                "content": (
                    "Survey of 40 active enterprise pilot customers: 88% stated pricing under $1,000/mo was an easy approval. "
                    "Primary purchase drivers: SAML SSO (required by IT security) and SOC-2 Type II report. "
                    "Competitor benchmark: Datadog and Auth0 charge $1,200+ for equivalent tiers."
                )
            }
        ],
        "proposals": [
            {
                "id": "prop_raise_pricing",
                "title": "Option A: Raise Base Tier from $499 to $899",
                "text": "Increase new enterprise signups to $899/mo while grandfathering existing customers for 12 months.",
                "viability_score": 1.3,
                "confidence": 0.53,
                "context_alignment_score": 1.4,
                "probabilities": {"0": 0.14, "1": 0.20, "2": 0.66}
            },
            {
                "id": "prop_keep_flat",
                "title": "Option B: Keep Base at $499, Add $299 Add-on",
                "text": "Keep base tier unchanged and charge separately for advanced analytics and SSO as add-ons.",
                "viability_score": 1.1,
                "confidence": 0.78,
                "context_alignment_score": 1.1,
                "probabilities": {"0": 0.23, "1": 0.54, "2": 0.23}
            },
            {
                "id": "prop_more_meetings",
                "title": "Option C: Form a Steering Committee",
                "text": "Commission a 6-week cross-functional study and schedule weekly syncs before deciding.",
                "viability_score": 0.9,
                "confidence": 0.79,
                "context_alignment_score": 0.7,
                "probabilities": {"0": 0.43, "1": 0.42, "2": 0.15}
            }
        ],
        "script": [
            {"speaker": "Dave (VP Product)", "text": "Alright everyone, we have 25 minutes left. We must decide today whether we raise the enterprise tier to $899 or keep it at $499 with add-ons."},
            {"speaker": "Karen (Director of Ops)", "text": "I hear that Dave, but I feel like we shouldn't boil the ocean without more stakeholder synergy and customer sentiment alignment."},
            {"speaker": "Chad (Head of Sales)", "text": "My team is already stretched thin. If we raise base prices, the optics will kill our close rates. We need to run it up the flagpole first."},
            {"speaker": "Sarah (Engineering Lead)", "text": "We spent the last 4 months building SOC-2 compliance and SAML SSO specifically for these enterprise accounts. The value is already there."},
            {"speaker": "Karen (Director of Ops)", "text": "Could we maybe take this offline and circle back at a later cadence? I just want to make sure we're touching base with marketing."},
            {"speaker": "Dave (VP Product)", "text": "Karen, this is the third meeting where we took it offline to circle back! We have 40 enterprise pilots waiting for a quote."},
            {"speaker": "Chad (Head of Sales)", "text": "Well, what if we double-click on customer empathy and create a working group to analyze the paradigms?"},
            {"speaker": "Sarah (Engineering Lead)", "text": "Grandfathering existing customers for 12 months eliminates sales friction. That addresses Chad's objection completely."}
        ]
    },
    {
        "id": "tech_bikeshedding",
        "title": "The Cloud Protocol Bikeshedding",
        "description": "Engineers and architects stall a production release debating gRPC vs REST serialization.",
        "topic": "Microservices Communication Protocol for Billing Gateway",
        "context_documents": [
            {
                "id": "doc_arch_decision",
                "title": "ADR-042: External Ingress Constraints",
                "content": (
                    "Architecture Decision Record 042 (Approved July 12): External client SDKs and third-party webhooks "
                    "require HTTPS/JSON REST. AWS Application Load Balancers for current cluster do not support gRPC streaming "
                    "without ingress rewrite scheduled for Q4. Team SLA requires billing gateway online by Sept 30."
                )
            }
        ],
        "proposals": [
            {
                "id": "prop_rest",
                "title": "Option A: Ship with FastAPI REST (Already Built)",
                "text": "Deploy the already completed and load-tested REST endpoints to unblock the billing launch."
            },
            {
                "id": "prop_grpc",
                "title": "Option B: Rewrite Gateway with gRPC / Protobuf",
                "text": "Delay launch by 3 weeks to rewrite network transport with strict binary schema definitions."
            }
        ],
        "script": [
            {"speaker": "Maya (Lead Dev)", "text": "The REST endpoints are written, 98% test coverage, and benchmarked at 12ms p99. We're ready to deploy to production tomorrow."},
            {"speaker": "Greg (Principal Architect)", "text": "Yes Maya, but from a strategic paradigms standpoint, gRPC gives us compile-time protobuf type safety across service boundaries."},
            {"speaker": "Liam (DevOps Lead)", "text": "Greg, our ingress controller doesn't even support HTTP/2 trailers right now. Rewriting for gRPC delays the billing launch by a month."},
            {"speaker": "Greg (Principal Architect)", "text": "Let's not optimize for short-term bandwidth over architectural purity. What if we do a deep dive workshop next Friday?"},
            {"speaker": "Maya (Lead Dev)", "text": "Customers are literally failing to pay invoices today. The business need is immediate, and REST latency is negligible."}
        ]
    },
    {
        "id": "rto_synergy",
        "title": "The 'Serendipitous Watercooler' Committee",
        "description": "Executive leadership debates in-office mandates using peak corporate jargon.",
        "topic": "Quarterly In-Office Collaboration & Attendance Guidelines",
        "context_documents": [
            {
                "id": "doc_pulse_survey",
                "title": "Q3 Engineering Pulse & Retention Audit",
                "content": (
                    "Key Findings: 74% of senior engineers stated full-week mandates would cause them to seek remote roles. "
                    "However, 82% favored 2 coordinated team days (Tuesdays/Thursdays) for high-bandwidth architecture reviews, "
                    "pairing, and design sprints. Office lease currently has 18 months remaining."
                )
            }
        ],
        "proposals": [
            {
                "id": "prop_anchor_days",
                "title": "Option A: 2 Fixed Team Anchor Days",
                "text": "Teams pick Tuesday and Thursday for shared sprint planning and collaborative sessions; remote other days."
            },
            {
                "id": "prop_full_flexible",
                "title": "Option B: Outcome-Based Remote First",
                "text": "Zero mandatory days; attendance evaluated purely on sprint velocity and project deliverables."
            }
        ],
        "script": [
            {"speaker": "Richard (COO)", "text": "We need to maximize serendipitous collision frequencies in the open workspace to accelerate cross-pollination of core competencies."},
            {"speaker": "Emily (VP People)", "text": "Richard, the data from our quarterly pulse survey shows engineering retention drops 30% if we mandate arbitrary seat warming."},
            {"speaker": "Richard (COO)", "text": "Let's double-click on that. Is that an optics issue, or a failure to socialize our cultural north star?"},
            {"speaker": "Jason (VP Product)", "text": "Two fixed anchor days (Tue/Thu) for collaborative design works great. People know when their teammates are physically present."}
        ]
    }
]

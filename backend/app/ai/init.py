"""
AI module.

Houses the platform's AI-driven features. Kept as its own top-level
package (separate from services/repositories) so prediction logic can
evolve independently - e.g. swapping the rule-based engine below for
a trained ML model later - without touching the rest of the app.
"""
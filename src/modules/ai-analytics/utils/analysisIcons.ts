// src/modules/ai-analytics/utils/analysisIcons.ts
import {
    Brain,
    Search,
    AlertTriangle,
    Shield,
    Rocket,
} from 'lucide-react-native';

export const analysisIcons: Record<string, any> = {
    'Diagnóstico general': Brain,
    'Hallazgos clave': Search,
    'Riesgos detectados': AlertTriangle,
    'Oportunidades de mejora': Rocket,
    'Recomendaciones accionables': Shield,
};

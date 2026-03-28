/**
 * Shared habit icon renderer
 * Supports both emoji strings and Phosphor icons (prefixed with "ph:")
 */
import React from 'react';
import {
    PencilLine, BookOpen, MagnifyingGlass, Brain, PenNib, Armchair,
    Trophy, Lightbulb, Target, Notebook, SoccerBall, PersonSimpleRun,
    Eye, Moon, Sun, Backpack, TShirt, Broom, ForkKnife, Timer,
    House, HandWaving, Heart, Smiley, Medal, ClockCountdown,
    WarningCircle, Windmill, SpeakerSlash, BookOpenText, Binoculars,
    Warning, DeviceMobile, GameController, SmileyAngry, ChatTeardropDots,
    Prohibit, MaskSad, SmileyMeh, HandFist, Trash, BowlFood,
    Alarm, CookingPot, Megaphone, ShieldWarning, Phone, Package,
    DownloadSimple, Star
} from '@phosphor-icons/react';

const PH_MAP = {
    PencilLine, BookOpen, MagnifyingGlass, Brain, PenNib, Armchair,
    Trophy, Lightbulb, Target, Notebook, PersonSimpleRun,
    Eye, Moon, Sun, Backpack, TShirt, Broom, ForkKnife, Timer,
    House, HandWaving, Heart, Smiley, Medal, ClockCountdown,
    WarningCircle, Windmill, SpeakerSlash, BookOpenText, Binoculars,
    Warning, DeviceMobile, GameController, SmileyAngry, ChatTeardropDots,
    Prohibit, MaskSad, SmileyMeh, HandFist, Trash, BowlFood,
    CookingPot, Megaphone, ShieldWarning, Phone, Package, Star,
    Soccer: SoccerBall,
    AlarmClock: Alarm,
    Download: DownloadSimple,
};

/**
 * Render a habit icon. Supports:
 * - "ph:BookOpen" → Phosphor icon
 * - "📚" → emoji
 * - "" → fallback
 */
export const renderHabitIcon = (iconEmoji, fallback = '✨', size = 18) => {
    if (!iconEmoji) return fallback;

    if (iconEmoji.startsWith('ph:')) {
        const name = iconEmoji.slice(3);
        const Icon = PH_MAP[name];
        if (Icon) return <Icon size={size} weight="fill" />;
        return fallback;
    }

    return iconEmoji;
};

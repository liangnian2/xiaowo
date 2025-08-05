import { useState, useEffect } from 'react';

// 统一主题类型定义
type Theme = 'light' | 'dark';
type MacaronColor = 'pink' | 'blue' | 'green' | 'purple' | 'yellow' | 'orange';

// 统一颜色配置 - 确保整体色调一致性
const COLOR_CONFIG = {
  primary: {
    light: '#ec4899', // 主粉色
    dark: '#f472b6',
  },
  secondary: {
    light: '#8b5cf6', // 主紫色
    dark: '#a78bfa',
  },
  accent: {
    light: '#f97316', // 强调色-橙色
    dark: '#fb923c',
  },
  background: {
    light: '#fff8f9', // 背景色
    dark: '#1e1b4b',
  },
  surface: {
    light: '#ffffff', // 卡片背景
    dark: '#312e81',
  },
  text: {
    primary: {
      light: '#1e293b', // 主要文本
      dark: '#f8fafc',
    },
    secondary: {
      light: '#64748b', // 次要文本
      dark: '#cbd5e1',
    },
  },
  border: {
    light: '#fecdd3', // 边框色
    dark: '#4f46e5',
  }
};

// 马卡龙色系定义 - 确保个性化色调与整体协调
const MACARON_COLORS = {
  pink: {
    bg: 'bg-pink-100',
    text: 'text-pink-600',
    border: 'border-pink-200',
    value: '#fbcfe8',
  },
  blue: {
    bg: 'bg-blue-100',
    text: 'text-blue-600',
    border: 'border-blue-200',
    value: '#bfdbfe',
  },
  green: {
    bg: 'bg-green-100',
    text: 'text-green-600',
    border: 'border-green-200',
    value: '#bbf7d0',
  },
  purple: {
    bg: 'bg-purple-100',
    text: 'text-purple-600',
    border: 'border-purple-200',
    value: '#ddd6fe',
  },
  yellow: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-600',
    border: 'border-yellow-200',
    value: '#fef3c7',
  },
  orange: {
    bg: 'bg-orange-100',
    text: 'text-orange-600',
    border: 'border-orange-200',
    value: '#fed7aa',
  },
};

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme) {
      return savedTheme;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });
  
  const [primaryColor, setPrimaryColor] = useState<MacaronColor>(() => {
    const savedColor = localStorage.getItem('primaryColor') as MacaronColor;
    return savedColor || 'pink';
  });

   // 根据主题获取颜色
   const getColor = (
     colorType: keyof typeof COLOR_CONFIG, 
     shade?: keyof (typeof COLOR_CONFIG[keyof typeof COLOR_CONFIG] extends object ? typeof COLOR_CONFIG[keyof typeof COLOR_CONFIG] : never)
   ) => {
     const colorGroup = COLOR_CONFIG[colorType];
     
     // 类型守卫：检查colorGroup是否为包含shade的对象
     if (
       shade && 
       typeof colorGroup === 'object' && 
       colorGroup !== null && 
       shade in colorGroup
     ) {
       return colorGroup[shade as keyof typeof colorGroup][theme];
     }
     
     // 确保colorGroup是具有当前主题的对象
     if (typeof colorGroup === 'object' && colorGroup !== null && theme in colorGroup) {
       return colorGroup[theme];
     }
     
     // 默认返回粉色作为后备
     return '#ec4899';
  };

  // 获取马卡龙色系样式
  const getMacaronColor = (color: MacaronColor) => MACARON_COLORS[color];

  // 主色调样式类
  const primaryColorClasses = `${getColor('primary')} text-white`;
  
  // 应用主题到文档
  useEffect(() => {
    // 设置CSS变量，使全局可访问主题颜色
    Object.entries(COLOR_CONFIG).forEach(([colorType, colorValues]) => {
      if (typeof colorValues === 'object') {
        Object.entries(colorValues).forEach(([shade, values]) => {
          document.documentElement.style.setProperty(
            `--color-${colorType}-${shade}-${theme}`, 
            values[theme]
          );
        });
      } else {
        document.documentElement.style.setProperty(
          `--color-${colorType}-${theme}`, 
          colorValues[theme]
        );
      }
    });
    
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);
  
  useEffect(() => {
    localStorage.setItem('primaryColor', primaryColor);
  }, [primaryColor]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };
  
  const setColor = (color: MacaronColor) => {
    setPrimaryColor(color);
  };

  return {
    theme,
    toggleTheme,
    isDark: theme === 'dark',
    primaryColor,
    setColor,
    getColor,
    getMacaronColor,
    primaryColorClasses,
    macaronColors: MACARON_COLORS,
    colorConfig: COLOR_CONFIG,
  };
} 
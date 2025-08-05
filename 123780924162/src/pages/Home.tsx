import { useState, useEffect } from 'react';
import { Calendar, BookOpen, Gift, PlusCircle, Edit, Trash2, Palette, Heart, Camera } from 'lucide-react';
import { toast } from 'sonner';
import { useTheme } from '@/hooks/useTheme';

  // 定义Web API权限接口
   interface PermissionDescriptor {
     name: string;
     userVisibleOnly?: boolean;
     sysex?: boolean;
   }
  
  // 定义记忆项类型
   interface JournalEntry {
     id: string;
     title: string;
     date: string;
     content: string;
   }
   
   interface Photo {
    id: string;
    url: string;
    caption?: string;
  }
  
  interface Memory {
    id: string;
    title: string;
    date: string;
    description: string;
    photos?: Photo[];
    hasPhotoWall?: boolean;
  }
 
 // 定义纪念日类型
 interface Anniversary {
   id: string;
   name: string;
   date: string;
   countdownFormat: 'days' | 'weeks' | 'months';
   photoUrl?: string;
 }



export default function Home() {
  // 主题和颜色
  const { primaryColor, setColor } = useTheme();
  const [modalColor, setModalColor] = useState<string>(primaryColor);
   const [contentOpacity, setContentOpacity] = useState<number>(0.9);
  
  // 马卡龙色值映射
  const macaronColors = {
    pink: 'bg-pink-100',
    blue: 'bg-blue-100',
    green: 'bg-green-100',
    purple: 'bg-purple-100',
    yellow: 'bg-yellow-100',
    orange: 'bg-orange-100'
  };
  
  const macaronColorValues = {
    pink: '#fbcfe8',
    blue: '#bfdbfe',
    green: '#bbf7d0',
    purple: '#ddd6fe',
    yellow: '#fef3c7',
    orange: '#fed7aa'
  };
  
   // 状态管理
   const [activeSection, setActiveSection] = useState('timeline');
   const [memories, setMemories] = useState<Memory[]>([]);
   const [editingMemory, setEditingMemory] = useState<Memory | null>(null);
   const [anniversaries, setAnniversaries] = useState<Anniversary[]>([]);
   const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
   const [showAddMemory, setShowAddMemory] = useState(false);
   const [homeBackground, setHomeBackground] = useState<string | null>(null);
   const [showBackgroundSettings, setShowBackgroundSettings] = useState(false);
   const [showAddAnniversary, setShowAddAnniversary] = useState(false);
   const [showAddJournal, setShowAddJournal] = useState(false);
   // 恋爱计时器状态
   const [relationshipStartDate, setRelationshipStartDate] = useState<Date | null>(null);
   const [relationshipSeconds, setRelationshipSeconds] = useState<number>(0);
  const [showColorPicker, setShowColorPicker] = useState<{journal: boolean}>({
    journal: false
  });
  // 恋爱纪念日设置状态
  const [showAnniversarySetting, setShowAnniversarySetting] = useState(false);
  // 图片查看模态框状态
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [newJournal, setNewJournal] = useState<{
    title: string;
    date: string;
    content: string;
  }>({
    title: '',
    date: new Date().toISOString().split('T')[0],
    content: ''
  });
  const [editingJournalId, setEditingJournalId] = useState<string | null>(null);
  const [editingAnniversary, setEditingAnniversary] = useState<Anniversary | null>(null);
  const [newAnniversary, setNewAnniversary] = useState<Omit<Anniversary, 'id'>>({
    name: '',
    date: '',
    countdownFormat: 'days',
    photoUrl: ''
  });
    const [newMemory, setNewMemory] = useState<Omit<Memory, 'id'>>({
      title: '',
      date: '',
      description: '',
      photos: [],
      hasPhotoWall: false
    });
    
     // 处理日记保存
     const handleSaveJournal = () => {
       if (!newJournal.title || !newJournal.date || !newJournal.content) {
         toast.error('请填写所有必填字段');
         return;
       }
       
       if (editingJournalId) {
         // 更新现有日记
         const updatedJournals = journalEntries.map(journal => 
           journal.id === editingJournalId 
             ? { ...journal, title: newJournal.title, date: newJournal.date, content: newJournal.content } 
             : journal
         );
         setJournalEntries(updatedJournals);
         toast.success('日记已更新！');
         
         // 更新时间线上的对应条目
         const journalIndex = journalEntries.findIndex(j => j.id === editingJournalId);
         if (journalIndex !== -1) {
           const updatedMemoryIndex = memories.findIndex(m => 
             m.date === journalEntries[journalIndex].date && 
             m.title === `日记: ${journalEntries[journalIndex].title}`
           );
           
           if (updatedMemoryIndex !== -1) {
             const updatedMemories = [...memories];
             updatedMemories[updatedMemoryIndex] = {
               ...updatedMemories[updatedMemoryIndex],
               title: `日记: ${newJournal.title}`,
               description: newJournal.content.substring(0, 100) + (newJournal.content.length > 100 ? '...' : '')
             };
             setMemories(updatedMemories);
           }
         }
       } else {
         // 创建新日记
         const newEntry: JournalEntry = {
           id: Date.now().toString(),
           title: newJournal.title,
           date: newJournal.date,
           content: newJournal.content
         };
         
         setJournalEntries([...journalEntries, newEntry]);
         toast.success('新日记已保存！');
         
         // 同时在时间线上添加一个简略条目
         const newMemory: Memory = {
           id: `journal-${newEntry.id}`,
           title: `日记: ${newEntry.title}`,
           date: newEntry.date,
           description: newEntry.content.substring(0, 100) + (newEntry.content.length > 100 ? '...' : '')
         };
         
         setMemories([...memories, newMemory]);
       }
       
       setShowAddJournal(false);
     };
    const [selectedJournal, setSelectedJournal] = useState<JournalEntry | null>(null);
    const [showJournalDetail, setShowJournalDetail] = useState(false);
   
   const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
   
   // 导入导出相关状态
    const [showExportDialog, setShowExportDialog] = useState(false);
    const [exportFilename, setExportFilename] = useState('');
    const [selectedDirectory, setSelectedDirectory] = useState<FileSystemDirectoryHandle | null>(null);
    
    // 处理添加记忆
     const handleAddMemory = () => {
      if (!newMemory.title || !newMemory.date || !newMemory.description) {
        toast.error('请填写所有必填字段');
        return;
      }
      
      if (editingMemory) {
        // 更新现有记忆
        const updatedMemories = memories.map(memory => {
          if (memory.id === editingMemory.id) {
            return {
              ...editingMemory,
              title: newMemory.title,
              date: newMemory.date,
              description: newMemory.description,
              hasPhotoWall: newMemory.hasPhotoWall,
              photos: selectedFiles.length > 0 
                ? selectedFiles.map((file, index) => ({
                    id: `photo-${Date.now()}-${index}`,
                    url: URL.createObjectURL(file)
                  }))
                : memory.photos
            };
          }
          return memory;
        });
        
        setMemories(updatedMemories);
        toast.success('记忆已成功更新！');
        setEditingMemory(null);
      } else {
        // 创建新记忆对象
        const memoryToAdd: Memory = {
          ...newMemory,
          id: Date.now().toString(),
           photos: selectedFiles.map((file, index) => {
             const date = new Date();
             const fileName = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}_${index}`;
             return {
               id: `photo-${Date.now()}-${index}`,
               folder: '记忆时间线',
               fileName: fileName,
               url: URL.createObjectURL(file)
             };
           })
         };
         
         // 添加到记忆列表
        setMemories([...memories, memoryToAdd]);
        toast.success('新记忆已添加成功！');
      }
      
      // 重置表单
      setNewMemory({
        title: '',
        date: '',
        description: '',
        photos: [],
        hasPhotoWall: false
      });
      
      // 关闭模态框并重置选中文件
      setShowAddMemory(false);
      setSelectedFiles([]);
    }
   
   // 生成默认导出文件名
   useEffect(() => {
     const defaultName = `love_story_backup_${new Date().toISOString().split('T')[0]}`;
     setExportFilename(defaultName);
   }, []);
   
   // 从本地存储加载数据
   useEffect(() => {
     // 检查离线状态
     if (!navigator.onLine) {
       document.getElementById('offline-status')?.classList.remove('hidden');
       document.getElementById('offline-status')?.classList.add('flex');
       toast.info('当前处于离线模式，部分功能可能受限');
     }
     
     // 监听网络状态变化
     window.addEventListener('online', () => {
       document.getElementById('offline-status')?.classList.add('hidden');
       document.getElementById('offline-status')?.classList.remove('flex');
       toast.success('网络已恢复连接');
     });
     
     window.addEventListener('offline', () => {
       document.getElementById('offline-status')?.classList.remove('hidden');
       document.getElementById('offline-status')?.classList.add('flex');
       toast.info('网络连接已断开，进入离线模式');
     });
     
     const savedMemories = localStorage.getItem('coupleMemories');
     const savedAnniversaries = localStorage.getItem('coupleAnniversaries');
     const savedJournal = localStorage.getItem('coupleJournal');
     const savedBackground = localStorage.getItem('coupleHomeBackground');
     
     if (savedMemories) setMemories(JSON.parse(savedMemories));
     if (savedAnniversaries) setAnniversaries(JSON.parse(savedAnniversaries));
     if (savedJournal) setJournalEntries(JSON.parse(savedJournal));
     if (savedBackground) setHomeBackground(savedBackground);
    
    // 添加默认数据（如果没有保存的数据）
    if (!savedAnniversaries) {
      const defaultAnniversaries = [
        { id: '1', name: '相识纪念日', date: '2023-01-15' }
      ];
      setAnniversaries(defaultAnniversaries);
      localStorage.setItem('coupleAnniversaries', JSON.stringify(defaultAnniversaries));
    }
  }, []);
  
  // 保存数据到本地存储
  useEffect(() => {
    localStorage.setItem('coupleMemories', JSON.stringify(memories));
  }, [memories]);
  
  useEffect(() => {
    localStorage.setItem('coupleAnniversaries', JSON.stringify(anniversaries));
  }, [anniversaries]);
  
  useEffect(() => {
    if (homeBackground) {
      localStorage.setItem('coupleHomeBackground', homeBackground);
    }
  }, [homeBackground]);

   useEffect(() => {
    localStorage.setItem('coupleJournal', JSON.stringify(journalEntries));
  }, [journalEntries]);

   // 计算两个日期之间的秒数差
  const calculateElapsedSeconds = (startDate: Date) => {
    const now = new Date();
    const diffTime = now.getTime() - startDate.getTime();
    return Math.floor(diffTime / 1000);
  };

  // 格式化日期为输入框格式
  const formatDateForInput = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  // 格式化时间差为天时分秒
  const formatTimeDifference = (startDate: Date, endDate: Date): string => {
    const diffTime = endDate.getTime() - startDate.getTime();
    const diffSeconds = Math.floor(diffTime / 1000);
    
    const days = Math.floor(diffSeconds / (3600 * 24));
    const hours = Math.floor((diffSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((diffSeconds % 3600) / 60);
    const seconds = diffSeconds % 60;
    
    return `${days}天 ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // 从localStorage加载恋爱开始日期
  useEffect(() => {
    const savedDate = localStorage.getItem('relationshipStartDate');
    if (savedDate) {
      setRelationshipStartDate(new Date(savedDate));
    } else if (anniversaries.length > 0) {
      // 回退方案：使用第一个纪念日作为开始日期
      const startDate = new Date(anniversaries[0].date);
      setRelationshipStartDate(startDate);
      localStorage.setItem('relationshipStartDate', startDate.toISOString());
    }
  }, [anniversaries]);
  
  // 恋爱计时器效果 - 每秒更新一次
  useEffect(() => {
    if (!relationshipStartDate) return;
    
    // 计算初始秒数
    setRelationshipSeconds(calculateElapsedSeconds(relationshipStartDate));
    
    // 每秒更新一次秒数
    const timerInterval = setInterval(() => {
      setRelationshipSeconds(prev => prev + 1);
    }, 1000);
    
    return () => clearInterval(timerInterval);
  }, [relationshipStartDate]);
  
  // 计算纪念日倒计时
  const calculateCountdown = (anniversaryDate: string, countdownFormat: 'days' | 'weeks' | 'months') => {
    const today = new Date();
    const anniversary = new Date(anniversaryDate);
    anniversary.setFullYear(today.getFullYear());
    
    if (anniversary < today) {
      anniversary.setFullYear(today.getFullYear() + 1);
    }
    
    const diffTime = anniversary.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    switch (countdownFormat) {
      case 'weeks':
        return Math.ceil(diffDays / 7);
      case 'months':
        return Math.ceil(diffDays / 30);
      default:
        return diffDays;
    }
   };
   
   // 检查纪念日是否已过
   const isAnniversaryPast = (anniversaryDate: string) => {
     const today = new Date();
     const anniversary = new Date(anniversaryDate);
     anniversary.setFullYear(today.getFullYear());
     
     if (anniversary < today) {
       return true;
     }
     return false;
   };
   
   // 计算纪念日已过去多长时间
   const calculateTimeSince = (anniversaryDate: string, format: 'days' | 'weeks' | 'months') => {
     const today = new Date();
     const anniversary = new Date(anniversaryDate);
     
     // 找到最近一次已过的纪念日年份
     let anniversaryYear = today.getFullYear();
     anniversary.setFullYear(anniversaryYear);
     if (anniversary > today) {
       anniversaryYear--;
       anniversary.setFullYear(anniversaryYear);
     }
     
     const diffTime = today.getTime() - anniversary.getTime();
     const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
     
     switch (format) {
       case 'weeks':
         return Math.floor(diffDays / 7);
       case 'months':
         return Math.floor(diffDays / 30);
       default:
         return diffDays;
     }
   };
   
   // 获取倒计时单位文本
   const getCountdownUnit = (format: string): string => {
      switch(format) {
        case 'weeks':
          return '周';
        case 'months':
          return '月';
        default:
          return '天';
      }
    };

     // 导出数据功能
  const handleExportData = async (customFilename?: string) => {
    // 请求下载权限（针对需要权限的浏览器）
    try {
      // 检查是否有权限或尝试获取权限
      if (document.queryCommandEnabled('SaveAs')) {
        // 某些浏览器支持此命令
        document.execCommand('SaveAs', false, customFilename);
      }
    } catch (permErr) {
      console.log('权限检查或请求失败，将使用标准下载方式:', permErr);
    }

    const data = {
      memories,
      anniversaries,
      journalEntries
    };

    // 验证数据
    if (!data.memories && !data.anniversaries && !data.journalEntries) {
      toast.error('没有可导出的数据');
      return;
    }
        
    const jsonString = JSON.stringify(data, null, 2);
    const filename = customFilename 
      ? `${customFilename.replace(/\.json$/, '')}.json`  // 确保有.json扩展名
      : `love_story_backup_${new Date().toISOString().split('T')[0]}.json`;
        
    try {
      // 创建Blob和下载链接
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      // 创建a标签并添加到DOM
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      
      // 确保元素对屏幕阅读器可见但视觉上隐藏
      a.style.position = 'fixed';
      a.style.top = '-100px';
      a.style.left = '-100px';
      
      document.body.appendChild(a);
      
      // 使用requestAnimationFrame确保DOM已更新
      requestAnimationFrame(() => {
        a.click();
        
        // 延迟移除元素以确保下载触发
        setTimeout(() => {
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          toast.success(`数据已成功导出: ${filename}`);
        }, 100);
      });
    } catch (err) {
      console.error('导出失败:', err);
      
      // 错误处理和用户反馈
      if (err instanceof Error) {
        if (err.message.includes('permission')) {
          toast.error('导出失败: 需要下载权限，请在浏览器设置中启用');
        } else {
          toast.error(`导出失败: ${err.message}`);
        }
      } else {
        toast.error('导出失败，请尝试手动保存页面数据');
      }
      
      // 最后的后备方案 - 创建文本区域让用户手动复制
      const textarea = document.createElement('textarea');
      textarea.value = jsonString;
      textarea.style.position = 'fixed';
      textarea.style.top = '50%';
      textarea.style.left = '50%';
      textarea.style.transform = 'translate(-50%, -50%)';
      textarea.style.width = '80%';
      textarea.style.height = '300px';
      textarea.style.zIndex = '9999';
      
      const button = document.createElement('button');
      button.textContent = '复制数据';
      button.style.position = 'fixed';
      button.style.top = 'calc(50% + 160px)';
      button.style.left = '50%';
      button.style.transform = 'translate(-50%, -50%)';
      button.style.zIndex = '10000';
      button.className = 'bg-pink-500 text-white px-4 py-2 rounded-lg';
      
      button.onclick = () => {
        textarea.select();
        document.execCommand('copy');
        toast.success('数据已复制到剪贴板，请手动保存为JSON文件');
        document.body.removeChild(textarea);
        document.body.removeChild(button);
      };
      
      document.body.appendChild(textarea);
      document.body.appendChild(button);
    }
  }
    
    // 打开导出对话框
    const openExportDialog = () => {
      setShowExportDialog(true);
    };
    
    // 确认导出
    const confirmExport = () => {
      if (exportFilename.trim()) {
        handleExportData(exportFilename);
        setShowExportDialog(false);
      } else {
        toast.error('请输入有效的文件名');
      }
    };
   
   // 导入数据功能
   const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
     const file = e.target.files?.[0];
     if (!file) return;
     
     const reader = new FileReader();
     reader.onload = (event) => {
       try {
         const importedData = JSON.parse(event.target?.result as string);
         
         if (importedData.memories) setMemories(importedData.memories);
         if (importedData.anniversaries) setAnniversaries(importedData.anniversaries);
         if (importedData.journalEntries) setJournalEntries(importedData.journalEntries);
         
         toast.success('数据已成功导入！');
       } catch (error) {
         toast.error('导入失败，请确保文件格式正确。');
         console.error('Import error:', error);
       }
     };
     reader.readAsText(file);
     
     // 重置input值，允许重复导入同一文件
     if (e.target) e.target.value = '';
   };
  

  
  // 渲染不同部分
  const renderSection = () => {
    switch (activeSection) {
      case 'timeline':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-pink-600">我们的记忆时间线</h2>
              <button 
                onClick={() => setShowAddMemory(true)}
                className="bg-pink-500 hover:bg-pink-600 text-white rounded-full p-2 transition-all transform hover:scale-110"
              >
                <PlusCircle size={24} />
              </button>
            </div>
            
            {showAddMemory && (
              <div className={`${macaronColors[modalColor as keyof typeof macaronColors]} rounded-xl shadow-lg p-6 space-y-4 animate-fadeIn`}>
           <div className="flex justify-between items-center">
  <h3 className="text-xl font-semibold text-pink-600">{editingMemory ? '编辑记忆' : '添加新记忆'}</h3>
            <button 
              onClick={() => setShowColorPicker(prev => ({...prev, memory: !prev.memory}))}
              className="text-gray-500 hover:text-pink-500 p-2 rounded-full hover:bg-gray-100 transition-colors"
              title="选择背景颜色"
            >
              <Palette size={20} />
            </button>
          </div>
          
          {showColorPicker.memory && (
            <div className="p-3 bg-gray-50 rounded-lg mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">选择背景颜色</h4>
              <div className="flex flex-wrap gap-2">
                {Object.keys(macaronColorValues).map((color) => {
                  const colorKey = color as keyof typeof macaronColorValues;
                  return (
                    <button
                      key={color}
                      onClick={() => setModalColor(colorKey)}
                      className={`w-10 h-10 rounded-full transition-transform ${
                        modalColor === colorKey ? 'ring-2 ring-pink-500 scale-110' : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: macaronColorValues[colorKey] }}
                    >
                      {modalColor === colorKey && (
                        <i className="fa-solid fa-check text-white text-xs mt-2.5 ml-2.5"></i>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          
          <div className="grid gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">标题</label>
                    <input
                      type="text"
                      value={newMemory.title}
                      onChange={(e) => setNewMemory({...newMemory, title: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">日期</label>
                    <input
                      type="date"
                      value={newMemory.date}
                      onChange={(e) => setNewMemory({...newMemory, date: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
                    <textarea
                      value={newMemory.description}
                      onChange={(e) => setNewMemory({...newMemory, description: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 min-h-[100px]"
                    />
                  </div>
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">照片墙</label>
                     <div className="flex items-center space-x-2">
                       <input
                         type="checkbox"
                         checked={newMemory.hasPhotoWall}
                         onChange={(e) => setNewMemory({...newMemory, hasPhotoWall: e.target.checked})}
                         className="rounded text-pink-500 focus:ring-pink-500"
                       />
                       <label>为此记忆创建照片墙</label>
                     </div>
                   </div>
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">照片 ({selectedFiles.length} 已选择)</label>
                     <input
                       type="file"
                       multiple
                       accept="image/*"
                       onChange={(e) => {
                         if (e.target.files) {
                           setSelectedFiles(Array.from(e.target.files));
                         }
                       }}
                       className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                     />
                     {selectedFiles.length > 0 && (
                       <div className="mt-2 flex flex-wrap gap-2">
                         {selectedFiles.slice(0, 3).map((file, index) => (
                           <div key={index} className="relative w-16 h-16 rounded-md overflow-hidden">
                             <img 
                               src={URL.createObjectURL(file)} 
                               alt={`预览 ${index + 1}`}
                               className="w-full h-full object-cover"
                             />
                           </div>
                         ))}
                         {selectedFiles.length > 3 && (
                           <div className="w-16 h-16 rounded-md bg-gray-100 flex items-center justify-center text-gray-500 text-sm">
                             +{selectedFiles.length - 3}
                           </div>
                         )}
                       </div>
                     )}
                   </div>
                   <div className="flex justify-end space-x-3">
                     <button 
                       onClick={() => {
                         setShowAddMemory(false);
                         setSelectedFiles([]);
                       }}
                       className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                     >
                       取消
                     </button>
                      <button 
                        onClick={() => {
                          setColor(modalColor as any);
                          handleAddMemory();
                        }}
                        className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
                      >
                        {editingMemory ? '更新' : '保存'}
                      </button>
                    </div>
                 </div>
               </div>
             )}
             
             {/* 添加柔和的渐变分隔线 */}
             <div className="h-px bg-gradient-to-r from-transparent via-pink-200 to-transparent my-6"></div>
             
             <div className="relative">
               {/* 时间线中心线 */}
               <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-pink-200"></div>
              
              {/* 时间线条目 */}
              <div className="space-y-8">
                {memories.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Heart className="mx-auto h-12 w-12 text-pink-300 mb-4" />
                    <p>你们的爱情故事等待开始... 添加你们的第一个记忆吧！</p>
                  </div>
                ) : (
                  memories
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((memory) => (
                       <div key={memory.id} className="relative pl-12">
                         {/* 时间线节点 */}
                         <div className={`absolute left-4 top-0 w-8 h-8 rounded-full flex items-center justify-center text-white z-10 ${
                           memory.title.startsWith('日记:') ? 'bg-pink-200' : 'bg-pink-500'
                         }`}>
                           <Heart size={16} />
                         </div>
                         
                         {/* 记忆卡片 */}
                         <div className={`rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1 hover:rotate-1 ${
                           memory.title.startsWith('日记:') ? 'bg-white/90' : 'bg-white'
                         }`}>
                           {/* 照片墙分支 */}
                           {memory.hasPhotoWall && memory.photos && memory.photos.length > 0 && (
                             <div className="relative ml-8 pl-8 border-l-2 border-pink-200 pb-6 animate-fadeIn">
                               <div className="absolute -left-[38px] top-0 w-16 h-16 rounded-full bg-pink-100 flex items-center justify-center border-4 border-white shadow-md z-10">
                                 <Camera size={24} className="text-pink-500" />
                               </div>
                               <h4 className="text-lg font-semibold text-gray-700 mb-4">我们的照片墙</h4>
                               <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                 {memory.photos.map((photo, index) => (
                                    <div 
                                      key={photo.id} 
                                      className="relative overflow-hidden rounded-lg shadow-md transform transition-all duration-300 hover:scale-105 hover:z-10 h-32"
                                    >
                                     <img 
                                       src={photo.url} 
                                       alt={`照片 ${index + 1}`}
                                       className="w-full h-full object-cover"
                                     />
                                     <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
                                       <i className="fa-solid fa-heart text-white text-xl transform scale-0 hover:scale-125 transition-transform duration-300"></i>
                                     </div>
                                   </div>
                                 ))}
                               </div>
                             </div>
                           )}
                           
                           {/* 单张照片 */}
                           {!memory.hasPhotoWall && memory.photos && memory.photos[0] && (
                             <div className="h-48 bg-gray-200 rounded-lg overflow-hidden">
                               <img 
                                 src={memory.photos[0].url} 
                                 alt={memory.title}
                                 className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                               />
                             </div>
                           )}
                           <div className="p-5">
                             <div className="flex justify-between items-start mb-2">
               <h3 className={`font-bold ${
  memory.title.startsWith('日记:') 
    ? 'text-gray-600 text-xs' 
    : 'text-gray-800 text-xl'
}`}>{memory.title}</h3>
                              <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                {new Date(memory.date).toLocaleDateString('zh-CN', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </span>
                            </div>
              <p className={`mb-4 ${
  memory.title.startsWith('日记:') ? 'text-gray-500 text-[10px]' : 'text-gray-600'
}`}>{memory.description}</p>
                            <div className="flex justify-end space-x-2">
                              <button 
                                className={`${
                                  memory.title.startsWith('日记:') 
                                    ? 'text-gray-300 cursor-not-allowed' 
                                    : 'text-gray-400 hover:text-pink-500'
                                }`}
  onClick={() => {
    if (memory.title.startsWith('日记:')) {
      toast.info('爱情日记请在日记页面编辑');
    } else {
      // 设置编辑状态并填充表单
      setEditingMemory(memory);
      setNewMemory({
        title: memory.title,
        date: memory.date,
        description: memory.description,
        photos: memory.photos || [],
        hasPhotoWall: memory.hasPhotoWall || false
      });
      setShowAddMemory(true);
    }
  }}
                              >
                                <Edit size={18} />
                              </button>
                              <button 
                                className="text-gray-400 hover:text-red-500"
                                onClick={() => setMemories(memories.filter(m => m.id !== memory.id))}
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>
        );
      case 'anniversary':
        return (
           <div className="space-y-6">
             <div className="flex justify-between items-center">
               <h2 className="text-2xl font-bold text-pink-600">重要纪念日</h2>
               <button 
                 onClick={() => setShowAddAnniversary(true)}
                 className="bg-pink-500 hover:bg-pink-600 text-white rounded-full p-2 transition-all transform hover:scale-110"
               >
                 <PlusCircle size={24} />
               </button>
             </div>
             
              {showAddAnniversary && (
               <div className="bg-white rounded-xl shadow-lg p-6 space-y-4 animate-fadeIn">
                 <h3 className="text-xl font-semibold text-pink-600">
                   {editingAnniversary ? '编辑纪念日' : '添加新纪念日'}
                 </h3>
                 <div className="grid gap-4">
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">纪念日名称</label>
                     <input
                       type="text"
                       value={newAnniversary.name}
                       onChange={(e) => setNewAnniversary({...newAnniversary, name: e.target.value})}
                       className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                     />
                   </div>
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">日期</label>
                     <input
                       type="date"
                       value={newAnniversary.date}
                       onChange={(e) => setNewAnniversary({...newAnniversary, date: e.target.value})}
                       className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                     />
                   </div>
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">倒计时格式</label>
                     <select
                       value={newAnniversary.countdownFormat}
                       onChange={(e) => setNewAnniversary({
                         ...newAnniversary, 
                         countdownFormat: e.target.value as 'days' | 'weeks' | 'months'
                       })}
                       className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                     >
                       <option value="days">天</option>
                       <option value="weeks">周</option>
                       <option value="months">月</option>
                     </select>
                   </div>
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">标题照片</label>
                     <input
                       type="file"
                       accept="image/*"
                       onChange={(e) => {
                         if (e.target.files && e.target.files[0]) {
                           const file = e.target.files[0];
                           const reader = new FileReader();
                           reader.onload = (event) => {
                             if (event.target && typeof event.target.result === 'string') {
                               // 这里我们使用URL.createObjectURL而不是读取文件内容
                               setNewAnniversary({
                                 ...newAnniversary,
                                 photoUrl: URL.createObjectURL(file)
                               });
                             }
                           };
                           reader.readAsDataURL(file);
                         }
                       }}
                       className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                     />
                     {newAnniversary.photoUrl && (
                       <div className="mt-2 w-32 h-32 rounded-md overflow-hidden">
                         <img 
                           src={newAnniversary.photoUrl} 
                           alt="预览"
                           className="w-full h-full object-cover"
                         />
                       </div>
                     )}
                   </div>
                   <div className="flex justify-end space-x-3">
                     <button 
                       onClick={() => {
                         setShowAddAnniversary(false);
                         setEditingAnniversary(null);
                       }}
                       className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                     >
                       取消
                     </button>
                     <button 
                       onClick={() => {
                         if (!newAnniversary.name || !newAnniversary.date) {
                           toast.error('请填写所有必填字段');
                           return;
                         }
                         
                         if (editingAnniversary) {
                           // 更新现有纪念日
                           const updatedAnniversaries = anniversaries.map(anniv => 
                             anniv.id === editingAnniversary.id ? { ...newAnniversary, id: anniv.id } : anniv
                           );
                           setAnniversaries(updatedAnniversaries);
                           toast.success('纪念日已更新！');
                         } else {
                           // 添加新纪念日
                           const newAnniv = {
                             ...newAnniversary,
                             id: Date.now().toString()
                           };
                           setAnniversaries([...anniversaries, newAnniv]);
                           toast.success('新纪念日已添加！');
                         }
                         
                         setShowAddAnniversary(false);
                         setEditingAnniversary(null);
                       }}
                       className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
                     >
                       保存
                     </button>
                   </div>
                 </div>
               </div>
             )}

             <div className="grid gap-6">
               {anniversaries.length === 0 ? (
                 <div className="text-center py-12 text-gray-500">
                   <Gift className="mx-auto h-12 w-12 text-pink-300 mb-4" />
                   <p>添加你们的第一个重要纪念日吧！</p>
                 </div>
               ) : (
                 anniversaries.map((anniversary) => (
                     <div key={anniversary.id} className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1 hover:rotate-1 flex flex-col sm:flex-row">
                      {/* 缩略图片 - 前方左侧 */}
                      {anniversary.photoUrl && (
                        <div className="w-full sm:w-32 h-32 sm:h-auto relative cursor-pointer"
                             onClick={() => {
                               setSelectedImageUrl(anniversary.photoUrl);
                               setShowImageModal(true);
                             }}>
                          <img 
                            src={anniversary.photoUrl} 
                            alt={anniversary.name}
                            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-colors flex items-center justify-center">
                            <i className="fa-solid fa-search-plus text-white text-xl opacity-0 hover:opacity-100 transition-opacity"></i>
                          </div>
                        </div>
                      )}
                      
                      {/* 内容区域 */}
                      <div className="flex-1 p-6 border-l-4 border-pink-500 flex flex-col">
                        <div className="flex-1 flex flex-col sm:flex-row justify-between">
                          <div className="mb-4 sm:mb-0">
                            <h3 className="text-xl font-bold text-gray-800">{anniversary.name}</h3>
                            <p className="text-gray-500 mt-1">
                              {new Date(anniversary.date).toLocaleDateString('zh-CN', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                          
                            {/* 时间显示区域 - 两列布局 */}
                           <div className="flex space-x-3">
                             {/* 已过去时间列 - 左侧 */}
                             <div className="text-center bg-pink-50 rounded-lg p-4 min-w-[120px] flex-1">
                               <p className="text-sm text-gray-500">已过去</p>
                               <p className="text-4xl font-bold text-pink-500">
                                 {calculateTimeSince(anniversary.date, anniversary.countdownFormat)}
                                 {getCountdownUnit(anniversary.countdownFormat)}
                               </p>
                             </div>
                             
                             {/* 倒计时列 - 右侧 */}
                             <div className="text-center bg-pink-50 rounded-lg p-4 min-w-[120px] flex-1">
                               <p className="text-sm text-gray-500">距离下次还有</p>
                               <p className="text-4xl font-bold text-pink-500">
                                 {calculateCountdown(anniversary.date, anniversary.countdownFormat)}
                                 {getCountdownUnit(anniversary.countdownFormat)}
                               </p>
                             </div>
                           </div>
                        </div>
                        
                        <div className="flex justify-end space-x-2 mt-4">
                          <button 
                            onClick={() => {
                              setEditingAnniversary(anniversary);
                              setNewAnniversary({
                                name: anniversary.name,
                                date: anniversary.date,
                                countdownFormat: anniversary.countdownFormat || 'days',
                                photoUrl: anniversary.photoUrl
                              });
                              setShowAddAnniversary(true);
                            }}
                            className="text-gray-400 hover:text-pink-500 p-2 rounded-full hover:bg-gray-100 transition-colors"
                            title="编辑"
                          >
                            <Edit size={18} />
                          </button>
                          <button 
                            onClick={() => {
                              setAnniversaries(anniversaries.filter(a => a.id !== anniversary.id));
                              toast.success('纪念日已删除');
                            }}
                            className="text-gray-400 hover:text-red-500 p-2 rounded-full hover:bg-gray-100 transition-colors"
                            title="删除"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                 ))
               )}
             </div>
           </div>
         );
      case 'journal':
        return (
           <div className="space-y-6">
             <div className="flex justify-between items-center">
               <h2 className="text-2xl font-bold text-pink-600">爱情日记</h2>
               <div id="offline-status" className="hidden items-center text-sm px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                 <i className="fa-solid fa-wifi-slash mr-1"></i> 离线模式
               </div>
             </div>
             
             {showAddJournal && (
                <div className={`${macaronColors[modalColor as keyof typeof macaronColors]} rounded-xl shadow-lg p-6 space-y-4 animate-fadeIn`}>
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-semibold text-pink-600">
                      {editingJournalId ? '编辑日记' : '添加新日记'}
                    </h3>
                    <button 
                      onClick={() => setShowColorPicker(prev => ({...prev, journal: !prev.journal}))}
                      className="text-gray-500 hover:text-pink-500 p-2 rounded-full hover:bg-gray-100 transition-colors"
                      title="选择背景颜色"
                    >
                      <Palette size={20} />
                    </button>
                  </div>
                  
                  {showColorPicker.journal && (
                    <div className="p-3 bg-gray-50 rounded-lg mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">选择背景颜色</h4>
                      <div className="flex flex-wrap gap-2">
                        {Object.keys(macaronColorValues).map((color) => {
                          const colorKey = color as keyof typeof macaronColorValues;
                          return (
                            <button
                              key={color}
                              onClick={() => setModalColor(colorKey)}
                              className={`w-10 h-10 rounded-full transition-transform ${
                                modalColor === colorKey ? 'ring-2 ring-pink-500 scale-110' : 'hover:scale-105'
                              }`}
                              style={{ backgroundColor: macaronColorValues[colorKey] }}
                            >
                              {modalColor === colorKey && (
                                <i className="fa-solid fa-check text-white text-xs mt-2.5 ml-2.5"></i>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  
                  <div className="grid gap-4">
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">标题</label>
                     <input
                       type="text"
                       value={newJournal.title}
                       onChange={(e) => setNewJournal({...newJournal, title: e.target.value})}
                       className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                     />
                   </div>
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">日期</label>
                     <input
                       type="date"
                       value={newJournal.date}
                       onChange={(e) => setNewJournal({...newJournal, date: e.target.value})}
                       className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                     />
                   </div>
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">日记内容</label>
                     <textarea
                       value={newJournal.content}
                       onChange={(e) => setNewJournal({...newJournal, content: e.target.value})}
                       className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 min-h-[150px]"
                     />
                   </div>
                   <div className="flex justify-end space-x-3">
                     <button 
                       onClick={() => {
                         setShowAddJournal(false);
                         setEditingJournalId(null);
                       }}
                       className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                     >
                       取消
                     </button>
                      <button 
                        onClick={() => {
                          setColor(modalColor as any);
                          handleSaveJournal();
                        }}
                        className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
                      >
                       保存日记
                     </button>
                   </div>
                 </div>
               </div>
             )}
             
             {showJournalDetail && selectedJournal && (
               <div className="bg-white rounded-xl shadow-lg p-6 space-y-4 animate-fadeIn">
                 <div className="flex justify-between items-center">
                   <h3 className="text-xl font-semibold text-pink-600">{selectedJournal.title}</h3>
                   <button 
                     onClick={() => setShowJournalDetail(false)}
                     className="text-gray-500 hover:text-gray-700"
                   >
                     <i className="fa-solid fa-times"></i>
                   </button>
                 </div>
                 <div className="text-gray-500 text-sm">
                   {new Date(selectedJournal.date).toLocaleDateString('zh-CN', {
                     year: 'numeric',
                     month: 'long',
                     day: 'numeric'
                   })}
                 </div>
                 <div className="border-t border-gray-100 pt-4">
                   <p className="whitespace-pre-line text-gray-700 leading-relaxed">{selectedJournal.content}</p>
                 </div>
                 <div className="flex justify-end pt-4 border-t border-gray-100">
                   <button 
                     onClick={() => {
                       setEditingJournalId(selectedJournal.id);
                       const journal = journalEntries.find(j => j.id === selectedJournal.id);
                       if (journal) {
                         setNewJournal({
                           title: journal.title || '',
                           date: journal.date,
                           content: journal.content
                         });
                       }
                       setShowJournalDetail(false);
                       setShowAddJournal(true);
                     }}
                     className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
                   >
                     <Edit size={16} className="mr-1" /> 编辑日记
                   </button>
                 </div>
               </div>
             )}
             
             <div className="flex justify-end mb-4">
               <button 
                 onClick={() => {
                   setShowAddJournal(true);
                   setEditingJournalId(null);
                   setNewJournal({
                     title: '',
                     date: new Date().toISOString().split('T')[0],
                     content: ''
                   });
                 }}
                 className="bg-pink-500 hover:bg-pink-600 text-white rounded-full p-3 transition-all transform hover:scale-110 flex items-center"
               >
                 <PlusCircle size={24} />
               </button>
             </div>
             
             {journalEntries.length === 0 ? (
               <div className="text-center py-12 text-gray-500 bg-white rounded-xl shadow-md">
                 <BookOpen className="mx-auto h-12 w-12 text-pink-300 mb-4" />
                 <p>开始记录你们的爱情故事吧！</p>
                 <p className="text-sm mt-2">每一篇日记都将成为珍贵的回忆</p>
               </div>
             ) : (
               <div className="space-y-4">
                 {journalEntries
                   .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                   .map((journal) => (
                      <div 
                        key={journal.id} 
                        className="bg-white rounded-xl shadow-md p-5 transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1 hover:rotate-1 cursor-pointer"
                        onClick={() => {
                          setSelectedJournal(journal);
                          setShowJournalDetail(true);
                        }}
                      >
                       <div className="flex justify-between items-start">
                         <h3 className="text-lg font-bold text-gray-800">{journal.title}</h3>
                         <div className="flex space-x-1">
                           <button 
                             onClick={(e) => {
                               e.stopPropagation();
                               setEditingJournalId(journal.id);
                               setNewJournal({
                                 title: journal.title || '',
                                 date: journal.date,
                                 content: journal.content
                               });
                               setShowAddJournal(true);
                             }}
                             className="text-gray-400 hover:text-pink-500 p-1"
                           >
                             <Edit size={16} />
                           </button>
                           <button 
                             onClick={(e) => {
                               e.stopPropagation();
                               if (window.confirm('确定要删除这篇日记吗？')) {
                                 setJournalEntries(journalEntries.filter(j => j.id !== journal.id));
                                 toast.success('日记已删除');
                               }
                             }}
                             className="text-gray-400 hover:text-red-500 p-1"
                           >
                             <Trash2 size={16} />
                           </button>
                         </div>
                       </div>
                       <p className="text-gray-500 text-sm mt-1">
                         {new Date(journal.date).toLocaleDateString('zh-CN', {
                           year: 'numeric',
                           month: 'long',
                           day: 'numeric'
                         })}
                       </p>
                       <p className="text-gray-600 mt-2 line-clamp-2">{journal.content}</p>
                     </div>
                   ))}
               </div>
             )}
           </div>
        );
      default:
        return <div>选择一个部分开始探索你们的爱情故事吧！</div>;
    }
  };
  
      return (
       <div className="min-h-screen relative" style={{ 
          backgroundImage: homeBackground 
            ? `url(${homeBackground})` 
            : 'linear-gradient(135deg, #ec4899, #8b5cf6)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          backgroundBlendMode: homeBackground ? 'normal' : 'normal'
        }}>
       {/* 顶部横幅 */}
           <div 
              className="relative h-64 overflow-hidden bg-transparent"
            >
              {/* 导入导出按钮和纪念日设置按钮 */}
              {/* 纪念日设置按钮 */}
              <button 
                onClick={() => setShowAnniversarySetting(true)}
                className="absolute top-4 right-40 bg-white bg-opacity-70 hover:bg-opacity-100 text-gray-700 rounded-full p-2 transition-all transform hover:scale-110 z-10"
                title="设置恋爱纪念日"
              >
                <i className="fa-solid fa-calendar-heart text-xl"></i>
              </button>
              
              {/* 导出按钮 - 打开自定义对话框 */}
              <button 
                onClick={openExportDialog}
                className="absolute top-4 right-28 bg-white bg-opacity-70 hover:bg-opacity-100 text-gray-700 rounded-full p-2 transition-all transform hover:scale-110 z-10"
                title="导出数据"
              >
                <i className="fa-solid fa-download text-xl"></i>
              </button>
              
              {/* 导出对话框 */}
               {showExportDialog && (
                 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
                   <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full">
                     <div className="flex justify-between items-center mb-4">
                       <h3 className="text-xl font-semibold text-pink-600">导出数据</h3>
                       <button 
                         onClick={() => setShowExportDialog(false)}
                         className="text-gray-500 hover:text-gray-700"
                       >
                         <i className="fa-solid fa-times text-xl"></i>
                       </button>
                     </div>
                     
                     <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">文件名</label>
                        <input
                          type="text"
                          value={exportFilename}
                          onChange={(e) => setExportFilename(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                          placeholder="输入导出文件名"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">导出位置</label>
                         <div className="flex items-center space-x-3">
                           <button 
                             onClick={() => {
                               // 请求下载权限
                               if (navigator.permissions && navigator.permissions.query) {
                                 navigator.permissions.query({ name: 'downloads' } as PermissionDescriptor)
                                   .then(permissionStatus => {
                                     if (permissionStatus.state === 'granted') {
                                       toast.success('下载权限已授予');
                                     } else if (permissionStatus.state === 'prompt') {
                                       toast.info('请允许浏览器的下载请求');
                                     } else {
                                       toast.error('下载权限被拒绝，请在浏览器设置中启用');
                                     }
                                   })
                                   .catch(err => {
                                     console.log('权限查询失败:', err);
                                     toast.info('准备导出数据，请允许浏览器下载');
                                   });
                               } else {
                                 toast.info('准备导出数据，请允许浏览器下载');
                               }
                             }}
                             className="flex-1 bg-pink-100 hover:bg-pink-200 text-pink-700 rounded-lg px-4 py-2 transition-colors flex items-center justify-center"
                           >
                             <i className="fa-solid fa-download mr-2"></i> 准备导出
                           </button>
                           
                           <span className="text-sm text-gray-600 truncate max-w-[120px]">
                             <i className="fa-solid fa-info-circle text-blue-500 mr-1"></i>
                             将保存到默认下载文件夹
                           </span>
                         </div>
                        
                         <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded-lg text-sm">
                           <div className="flex items-start">
                             <i className="fa-solid fa-info-circle text-blue-500 mt-0.5 mr-2"></i>
                             <div>
                               <p className="text-gray-700 font-medium mb-1">导出说明</p>
                               <p className="text-gray-600">
                                 点击"确认导出"后，文件将保存到您的默认下载文件夹。
                                 如果没有自动下载，请检查浏览器的弹出窗口阻止设置。
                               </p>
                             </div>
                           </div>
                         </div>
                      </div>
                       
                       <div className="flex justify-end space-x-3 pt-4">
                         <button 
                           onClick={() => {
                             setShowExportDialog(false);
                             setSelectedDirectory(null); // 重置选择的目录
                           }}
                           className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                         >
                           取消
                         </button>
                         <button 
                           onClick={confirmExport}
                           className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
                         >
                           确认导出
                         </button>
                       </div>
                     </div>
                   </div>
                 </div>
               )}
             
             <button 
               onClick={() => document.getElementById('import-input')?.click()}
               className="absolute top-4 right-16 bg-white bg-opacity-70 hover:bg-opacity-100 text-gray-700 rounded-full p-2 transition-all transform hover:scale-110 z-10"
               title="导入数据"
             >
               <i className="fa-solid fa-upload text-xl"></i>
             </button>
             <input 
               type="file" 
               id="import-input" 
               accept=".json" 
               className="hidden"
               onChange={handleImportData}
             />

              {/* 恋爱纪念日设置模态框 */}
              {showAnniversarySetting && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
                  <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-semibold text-pink-600">设置恋爱纪念日</h3>
                      <button 
                        onClick={() => setShowAnniversarySetting(false)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <i className="fa-solid fa-times text-xl"></i>
                      </button>
                    </div>
                    
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">我们的恋爱开始日期</label>
                        <input
                          type="date"
                          value={relationshipStartDate ? formatDateForInput(relationshipStartDate) : ''}
                          onChange={(e) => {
                            const newDate = new Date(e.target.value);
                            setRelationshipStartDate(newDate);
                            localStorage.setItem('relationshipStartDate', newDate.toISOString());
                          }}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                        />
                      </div>
                      
                      {relationshipStartDate && (
                        <div className="p-4 bg-pink-50 rounded-lg text-center">
                          <p className="text-gray-700 mb-2">我们已经相爱：</p>
                          <p className="text-2xl font-bold text-pink-600">
                            {formatTimeDifference(relationshipStartDate, new Date())}
                          </p>
                        </div>
                      )}
                      
                      <div className="flex justify-end space-x-3 pt-4">
                        <button 
                          onClick={() => setShowAnniversarySetting(false)}
                          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                          取消
                        </button>
                        <button 
                          onClick={() => {
                            if (!relationshipStartDate) {
                              toast.error('请选择恋爱开始日期');
                              return;
                            }
                            setShowAnniversarySetting(false);
                            toast.success('恋爱纪念日设置成功！');
                          }}
                          className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
                        >
                          保存设置
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            {/* 背景设置按钮 */}
            {/* 背景设置按钮 */}
            <button 
              onClick={() => setShowBackgroundSettings(true)}
              className="absolute top-4 right-4 bg-white bg-opacity-70 hover:bg-opacity-100 text-gray-700 rounded-full p-2 transition-all transform hover:scale-110 z-10"
            >
              <i className="fa-solid fa-image text-xl"></i>
            </button>
           
           {/* 背景图设置模态框 */}
           {showBackgroundSettings && (
             <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
               <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
                 <div className="flex justify-between items-center mb-4">
                   <h3 className="text-xl font-semibold text-pink-600">更换背景图</h3>
                   <button 
                     onClick={() => setShowBackgroundSettings(false)}
                     className="text-gray-500 hover:text-gray-700"
                   >
                     <i className="fa-solid fa-times text-xl"></i>
                   </button>
                 </div>
                 
                 <div className="space-y-6">
                   <div>
                     <h4 className="text-lg font-medium text-gray-700 mb-3">上传自定义背景</h4>
                     <input
                       type="file"
                       accept="image/*"
                       onChange={(e) => {
                         if (e.target.files && e.target.files[0]) {
                           const file = e.target.files[0];
                           setHomeBackground(URL.createObjectURL(file));
                           setShowBackgroundSettings(false);
                           toast.success('背景图已更新！');
                         }
                       }}
                       className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                     />
                   </div>
                   
                   <div>
                     <h4 className="text-lg font-medium text-gray-700 mb-3">选择预设背景</h4>
                     <div className="grid grid-cols-2 gap-3">
                         <div className="mb-4">
                           <h5 className="text-sm font-medium text-gray-600 mb-2">浪漫氛围</h5>
                           <div className="grid grid-cols-2 gap-3">
                             {[
                               'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=romantic%20couple%20background%20blue%20pink%20gradient&sign=36ff980022ce2d328289389b99cfe3e7',
                               'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=starry%20night%20romantic%20background&sign=ae1dd3866eb7b7a350da7d9c317d61a2',
                               'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=sunset%20over%20mountains%20couple%20view&sign=9491ced643ea4025b4030df0dc2b0efd',
                               'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=romantic%20dinner%20candlelight%20background&sign=70a9731f5eece43e169eded11cfbe420',
                               'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=valentines%20day%20romantic%20background%20with%20hearts&sign=82b1aac68ef2b318d7d6e93f862f67a7',
                               'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=romantic%20beach%20sunset%20with%20couple%20silhouette&sign=ebca8c4ca8f8d3ebed0eb156f03d933a'
                             ].map((imgUrl, index) => (
                               <div 
                                 key={`romantic-${index}`} 
                                 className={`relative rounded-lg overflow-hidden cursor-pointer transition-all duration-300 ${
                                   homeBackground === imgUrl 
                                     ? 'ring-4 ring-pink-400 shadow-lg scale-105' 
                                     : 'hover:scale-105 hover:shadow-md'
                                 }`}
                                 onClick={() => {
                                   setHomeBackground(imgUrl);
                                   toast.success('背景图已更新！');
                                 }}
                               >
                                 <img 
                                   src={imgUrl} 
                                   alt={`浪漫背景 ${index + 1}`}
                                   className="w-full h-32 object-cover"
                                 />
                                 {homeBackground === imgUrl && (
                                   <>
                                     <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end justify-center pb-2">
                                       <span className="text-white font-medium flex items-center">
                                         <i className="fa-solid fa-check-circle mr-1"></i> 已选中
                                       </span>
                                     </div>
                                     <div className="absolute top-2 right-2 bg-pink-500 rounded-full p-1">
                                       <i className="fa-solid fa-check text-white text-sm"></i>
                                     </div>
                                   </>
                                 )}
                               </div>
                             ))}
                           </div>
                         </div>
                        
                         <div className="mb-4">
                           <h5 className="text-sm font-medium text-gray-600 mb-2">自然风景</h5>
                           <div className="grid grid-cols-2 gap-3">
                             {[
                               'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=beach%20sunset%20romantic%20background&sign=4c39ca2f1cb916db3cfab8843786f88c',
                               'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=flower%20field%20romantic%20background&sign=fc05bedbd140171b8c8d4592e12a41b6',
                               'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=forest%20path%20sunlight%20through%20trees&sign=2f2960e675195cb38beed057933d2fa4',
                               'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=ocean%20waves%20tropical%20beach%20view&sign=7a1f7b02d850b72873084b5d861f0dd6',
                               'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=misty%20mountain%20landscape%20with%20lake&sign=2ee8a3b757ae36f206702a0815796f0c',
                               'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=autumn%20forest%20with%20colorful%20leaves&sign=278a54280adc895fe90658a4327352e1'
                             ].map((imgUrl, index) => (
                               <div 
                                 key={`nature-${index}`} 
                                 className={`relative rounded-lg overflow-hidden cursor-pointer transition-all duration-300 ${
                                   homeBackground === imgUrl 
                                     ? 'ring-4 ring-pink-400 shadow-lg scale-105' 
                                     : 'hover:scale-105 hover:shadow-md'
                                 }`}
                                 onClick={() => {
                                   setHomeBackground(imgUrl);
                                   toast.success('背景图已更新！');
                                 }}
                               >
                                 <img 
                                   src={imgUrl} 
                                   alt={`自然背景 ${index + 1}`}
                                   className="w-full h-32 object-cover"
                                 />
                                 {homeBackground === imgUrl && (
                                   <>
                                     <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end justify-center pb-2">
                                       <span className="text-white font-medium flex items-center">
                                         <i className="fa-solid fa-check-circle mr-1"></i> 已选中
                                       </span>
                                     </div>
                                     <div className="absolute top-2 right-2 bg-pink-500 rounded-full p-1">
                                       <i className="fa-solid fa-check text-white text-sm"></i>
                                     </div>
                                   </>
                                 )}
                               </div>
                             ))}
                           </div>
                         </div>
                        
                         <div>
                           <h5 className="text-sm font-medium text-gray-600 mb-2">艺术抽象</h5>
                           <div className="grid grid-cols-2 gap-3">
                             {[
                               'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=pastel%20color%20gradient%20soft%20background&sign=beca2db84f1195eb5e2f704b7dc43d7a',
                               'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=abstract%20watercolor%20painting%20soft%20colors&sign=7bfd98b0c7f9c965f0d0798b3ec411a4',
                               'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=geometric%20pattern%20minimalist%20pastel&sign=fa2b08edcea0e8333ae7ec42e7235c99',
                               'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=soft%20clouds%20watercolor%20background&sign=7bf5c57fad798f0ca582c375f287890d',
                               'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=abstract%20fluid%20colors%20gradient%20background&sign=8329a3a651a721cadc45a028d0658945',
                               'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=modern%20art%20minimalist%20pastel%20composition&sign=d9d04961ccd012efc511061da8144e89'
                             ].map((imgUrl, index) => (
                               <div 
                                 key={`abstract-${index}`} 
                                 className={`relative rounded-lg overflow-hidden cursor-pointer transition-all duration-300 ${
                                   homeBackground === imgUrl 
                                     ? 'ring-4 ring-pink-400 shadow-lg scale-105' 
                                     : 'hover:scale-105 hover:shadow-md'
                                 }`}
                                 onClick={() => {
                                   setHomeBackground(imgUrl);
                                   toast.success('背景图已更新！');
                                 }}
                               >
                                 <img 
                                   src={imgUrl} 
                                   alt={`抽象背景 ${index + 1}`}
                                   className="w-full h-32 object-cover"
                                 />
                                 {homeBackground === imgUrl && (
                                   <>
                                     <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end justify-center pb-2">
                                       <span className="text-white font-medium flex items-center">
                                         <i className="fa-solid fa-check-circle mr-1"></i> 已选中
                                       </span>
                                     </div>
                                     <div className="absolute top-2 right-2 bg-pink-500 rounded-full p-1">
                                       <i className="fa-solid fa-check text-white text-sm"></i>
                                     </div>
                                   </>
                                 )}
                               </div>
                             ))}
                           </div>
                         </div>
                     </div>
                   </div>
                   
                   {homeBackground && (
                     <button 
                       onClick={() => {
                         setHomeBackground(null);
                         localStorage.removeItem('coupleHomeBackground');
                         setShowBackgroundSettings(false);
                         toast.success('已恢复默认背景！');
                       }}
                       className="w-full py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                     >
                       恢复默认背景
                     </button>
                   )}
                 </div>
               </div>
             </div>
           )}
           
           <div className="absolute inset-0 opacity-20">
             {[...Array(20)].map((_, i) => (
            <Heart 
              key={i} 
              className="absolute text-white"
              style={{ 
                top: `${Math.random() * 100}%`, 
                left: `${Math.random() * 100}%`,
                fontSize: `${10 + Math.random() * 20}px`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 7}s`
              }}
            />
          ))}
        </div>
        <div className="relative h-full flex flex-col items-center justify-center text-white text-center p-6">
               <div className="relative flex flex-col items-center z-10">
                  <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-xl tracking-wide animate-name-float">
                       <span className="name-highlight px-4 py-2 rounded-lg backdrop-blur-sm" style={{ 
                           fontFamily: '"Xingkai", "STXingkai", "KaiTi", "STKaiti", serif', 
                           color: 'white',
                           textShadow: '0 2px 4px rgba(236, 72, 153, 0.5)',
                           letterSpacing: '2px',
                           transform: 'rotate(-1deg)',
                           display: 'inline-block'
                         }}>李兴凯</span> 
                        <span className="mx-3 text-pink-300 animate-pulse-soft">♥</span> 
                         <span className="name-highlight px-4 py-2 rounded-lg backdrop-blur-sm" style={{ 
                           fontFamily: '"Xingkai", "STXingkai", "KaiTi", "STKaiti", serif', 
                           color: 'white',
                           textShadow: '0 2px 4px rgba(236, 72, 153, 0.5)',
                           letterSpacing: '2px',
                           transform: 'rotate(1deg)',
                           display: 'inline-block'
                         }}>张璐月</span>
                  </h1>
                  <div className="absolute -bottom-2 w-full h-1 bg-gradient-to-r from-transparent via-white to-transparent"></div>
            </div>
           <p className="text-lg md:text-xl max-w-md drop-shadow-sm" style={{ marginTop: '18px' }}>记录每一个珍贵瞬间，珍藏属于我们的美好回忆</p>
        </div>
      </div>
      
      {/* 主内容区 */}
        <div className="max-w-4xl mx-auto px-4 py-8 bg-white/80 backdrop-blur-sm rounded-2xl mb-8 shadow-lg">
         {/* 导航选项卡 */}
          <div className="flex justify-center mb-8 overflow-x-auto pb-2 bg-white/90 backdrop-blur-sm rounded-xl p-2 shadow-sm">
           <div className="flex space-x-2 md:space-x-4">
             <button
               onClick={() => setActiveSection('timeline')}
               className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-300 transform ${
                 activeSection === 'timeline' 
                   ? 'bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-md scale-105' 
                   : 'bg-white text-gray-600 hover:bg-gray-50 hover:scale-105'
               }`}
             >
               <Calendar size={20} />
               <span>记忆时间线</span>
             </button>
             <button
               onClick={() => setActiveSection('anniversary')}
               className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-300 transform ${
                 activeSection === 'anniversary' 
                   ? 'bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-md scale-105' 
                   : 'bg-white text-gray-600 hover:bg-gray-50 hover:scale-105'
               }`}
             >
               <Gift size={20} />
               <span>纪念日</span>
             </button>
             <button
               onClick={() => setActiveSection('journal')}
               className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-300 transform ${
                 activeSection === 'journal' 
                   ? 'bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-md scale-105' 
                   : 'bg-white text-gray-600 hover:bg-gray-50 hover:scale-105'
               }`}
             >
               <BookOpen size={20} />
               <span>爱情日记</span>
             </button>
           </div>
         </div>
        
        {/* 内容区域 */}
         <div className="animate-fadeIn bg-white/95 backdrop-blur-sm rounded-xl p-6">
          {renderSection()}
        </div>
      </div>
      
         {/* 页脚 - 固定在页面最底部 */}
         <footer className="bg-pink-50 border-t border-pink-100 py-4 fixed bottom-0 left-0 right-0 z-10">
           <div className="max-w-4xl mx-auto px-4 text-center">
              <div className="text-pink-600 font-medium mb-1 animate-pulse-soft">
                {relationshipStartDate ? (
                  <p>已恋爱: {formatTimeDifference(relationshipStartDate, new Date())}</p>
                ) : (
                  <p className="text-gray-400">请设置恋爱纪念日开始计算</p>
                )}
              </div>
              <p className="text-gray-500 text-sm">© 2025 李兴凯和张璐月的爱情故事 - 永远珍藏每一刻</p>
           </div>
         </footer>
        
        {/* 为固定页脚添加内容底部间距 */}
        <div className="h-20"></div>
       
       {/* 图片查看模态框 */}
       {showImageModal && selectedImageUrl && (
         <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4 animate-fadeIn">
           <div className="relative max-w-4xl w-full max-h-[90vh]">
             <button 
               onClick={() => setShowImageModal(false)}
               className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-colors z-10"
             >
               <i className="fa-solid fa-times text-xl"></i>
             </button>
             
             <button 
               onClick={() => {
                 const link = document.createElement('a');
                 link.href = selectedImageUrl;
                 link.download = `anniversary_${Date.now()}.jpg`;
                 document.body.appendChild(link);
                 link.click();
                 document.body.removeChild(link);
                 toast.success('图片已开始下载');
               }}
               className="absolute top-4 left-4 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-colors z-10"
               title="下载图片"
             >
               <i className="fa-solid fa-download text-xl"></i>
             </button>
             
             <div className="bg-white rounded-lg overflow-hidden max-h-[90vh] flex items-center justify-center">
               <img 
                 src={selectedImageUrl} 
                 alt="Enlarged view"
                 className="max-w-full max-h-[90vh] object-contain"
               />
             </div>
           </div>
         </div>
       )}
     </div>
  );
}
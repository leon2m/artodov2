import { useState, useEffect } from 'react';
import { Task } from '@/types/task';
import { DashboardChartData, TaskStats } from '@/lib/types/dashboard';
import { format, isToday, isThisWeek, startOfWeek, addDays, isValid, parseISO, isSameDay } from 'date-fns';

// Tarih işleme yardımcı fonksiyonları
const safeParseDate = (dateString: string): Date => {
  try {
    // Önce tarih string'inin geçerli olup olmadığını kontrol edelim
    if (!dateString || typeof dateString !== 'string') {
      return new Date(); // Geçersizse bugünü dön
    }
    
    // Bazı geçersiz formatlar RangeError'a neden olabilir
    if (dateString.trim() === '' || dateString.length < 8) {
      return new Date();
    }
    
    // Date formatının geçerli olduğunu kontrol et (YYYY-MM-DD en azından)
    if (!/^\d{4}-\d{2}-\d{2}/.test(dateString)) {
      return new Date();
    }
    
    const parsedDate = parseISO(dateString);
    
    // parseISO sonucunun geçerli bir tarih olup olmadığını kontrol et
    if (!isValid(parsedDate) || isNaN(parsedDate.getTime())) {
      return new Date(); // Geçersizse bugünü dön
    }
    
    return parsedDate;
  } catch (error) {
    console.warn('Tarih ayrıştırma hatası:', error);
    return new Date(); // Hata durumunda bugünü dön
  }
};

const safeFormatDate = (date: Date | string, formatString: string, options?: any): string => {
  try {
    if (!date) return format(new Date(), formatString, options);
    
    const parsedDate = typeof date === 'string' ? safeParseDate(date) : date;
    
    // Son bir kontrol daha
    if (!isValid(parsedDate) || isNaN(parsedDate.getTime())) {
      return format(new Date(), formatString, options);
    }
    
    return format(parsedDate, formatString, options);
  } catch (error) {
    console.warn('Tarih biçimlendirme hatası:', error);
    return format(new Date(), formatString, options); // Hata durumunda bugünü formatlayarak dön
  }
};

// Bugün aynı gün olup olmadığını kontrol eden yardımcı fonksiyon
const isSameToday = (dateString: string): boolean => {
  try {
    if (!dateString) return false;
    const date = safeParseDate(dateString);
    const today = new Date();
    return isSameDay(date, today);
  } catch (error) {
    console.warn('Tarih karşılaştırma hatası:', error);
    return false;
  }
};

export function useDashboardStats(tasks: Task[]) {
  const [taskStats, setTaskStats] = useState<TaskStats>({
    pending: 0,
    completed: 0,
    total: 0,
    progress: 0
  });
  
  const [chartData, setChartData] = useState<DashboardChartData>({
    categories: [],
    priorities: []
  });
  
  const [todayTasks, setTodayTasks] = useState<Task[]>([]);
  const [thisWeekTasks, setThisWeekTasks] = useState<Task[]>([]);
  
  // Yeni istatistikler
  const [weeklyData, setWeeklyData] = useState<{
    date: string;
    completed: number;
    total: number;
    percentage: number;
  }[]>([]);
  
  const [successRate, setSuccessRate] = useState({
    rate: 0,
    completedCount: 0,
    totalCount: 0,
    weeklyGoal: 10, // Varsayılan haftalık hedef
  });
  
  useEffect(() => {
    if (!tasks || tasks.length === 0) return;
    
    // Temel istatistikler
    const completed = tasks.filter(task => task.status === 'completed').length;
    const total = tasks.length;
    const pending = total - completed;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    setTaskStats({
      pending,
      completed,
      total,
      progress
    });
    
    // Bugün ve bu haftanın görevleri - Güvenli tarih kontrolü ile
    const today = new Date();
    
    const todayTaskItems = tasks.filter(task => {
      try {
        // Önemli: Hem dueDate hem de date alanlarını kontrol et
        if (task.dueDate) {
          // Task.dueDate zaten Date objesi
          return isSameDay(task.dueDate, today);
        } else if (task.date) {
          // Task.date bir string, güvenli bir şekilde parse et
          const taskDate = safeParseDate(task.date);
          return isSameDay(taskDate, today);
        }
        return false;
      } catch (error) {
        console.warn('Bugünkü görev filtreleme hatası:', error);
        return false;
      }
    });
    
    const weekTaskItems = tasks.filter(task => {
      try {
        if (task.dueDate) {
          return isThisWeek(task.dueDate, { weekStartsOn: 1 }); // Haftanın Pazartesi'den başladığını belirt  
        } else if (task.date) {
          const taskDate = safeParseDate(task.date);
          return isThisWeek(taskDate, { weekStartsOn: 1 }); // Haftanın Pazartesi'den başladığını belirt
        }
        return false;
      } catch (error) {
        console.warn('Haftalık görev filtreleme hatası:', error);
        return false;
      }
    });
    
    // Görevleri tarihe göre sırala - önce daha yakın tarihler
    const sortTasks = (taskList: Task[]): Task[] => {
      return [...taskList].sort((a, b) => {
        const dateA = a.dueDate || (a.date ? safeParseDate(a.date) : new Date());
        const dateB = b.dueDate || (b.date ? safeParseDate(b.date) : new Date());
        return dateA.getTime() - dateB.getTime();
      });
    };
    
    setTodayTasks(sortTasks(todayTaskItems));
    setThisWeekTasks(sortTasks(weekTaskItems));
    
    // Kategori ve öncelik dağılımı için chart verileri
    const categories: Record<string, number> = {};
    const priorities: Record<string, number> = {};
    
    // Görevleri dolaşarak kategori ve öncelik sayılarını topla
    tasks.forEach(task => {
      // Kategori sayımı
      const categoryName = task.categoryId ? getCategoryName(task.categoryId) : 'Diğer';
      categories[categoryName] = (categories[categoryName] || 0) + 1;
      
      // Öncelik sayımı
      const priority = task.priority || 'medium';
      priorities[priority] = (priorities[priority] || 0) + 1;
    });
    
    // Chart için veri formatını dönüştür
    const categoryData = Object.entries(categories).map(([name, count]) => ({
      name,
      count,
      color: getCategoryColor(name)
    }));
    
    const priorityData = Object.entries(priorities).map(([name, count]) => ({
      name: getPriorityLabel(name),
      count,
      color: getPriorityColor(name)
    }));
    
    setChartData({
      categories: categoryData,
      priorities: priorityData
    });
    
    // Haftalık ilerleme verisi güncellemesi - her iki tarih alanını da kontrol et
    try {
      const weekStartDate = startOfWeek(today, { weekStartsOn: 1 }); // Pazartesi başlangıç
      const weeklyProgressData = Array.from({ length: 7 }, (_, index) => {
        try {
          const currentDate = addDays(weekStartDate, index);
          const dateStr = safeFormatDate(currentDate, 'yyyy-MM-dd');
          
          const dayTasks = tasks.filter(task => {
            try {
              if (task.dueDate) {
                return isSameDay(task.dueDate, currentDate);
              } else if (task.date) {
                const taskDateStr = safeFormatDate(safeParseDate(task.date), 'yyyy-MM-dd');
                return taskDateStr === dateStr;
              }
              return false;
            } catch {
              return false;
            }
          });
          
          const dayCompleted = dayTasks.filter(task => task.status === 'completed').length;
          const dayTotal = dayTasks.length;
          const percentage = dayTotal > 0 ? Math.round((dayCompleted / dayTotal) * 100) : 0;
          
          return {
            date: dateStr,
            completed: dayCompleted,
            total: dayTotal,
            percentage
          };
        } catch (error) {
          console.warn(`Gün verisi hesaplama hatası (index: ${index}):`, error);
          // Gün için hata oluşursa varsayılan nesne döndür
          return {
            date: '',
            completed: 0,
            total: 0,
            percentage: 0
          };
        }
      });
      
      // Boş tarih değeri içeren öğeleri filtrele
      const validWeeklyData = weeklyProgressData.filter(item => item.date);
      
      setWeeklyData(validWeeklyData.length > 0 ? validWeeklyData : []);
    } catch (error) {
      console.warn('Haftalık veri oluşturma hatası:', error);
      // Hata durumunda boş veri dizisi oluştur
      setWeeklyData([]);
    }
    
    // Başarı oranı hesaplama - Güvenli tarih kontrolü ile
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const recentTasks = tasks.filter(task => {
        try {
          if (!task.date) return false;
          const taskDate = safeParseDate(task.date);
          return taskDate >= thirtyDaysAgo;
        } catch {
          return false;
        }
      });
      
      const recentCompleted = recentTasks.filter(task => task.status === 'completed').length;
      const recentTotal = recentTasks.length;
      
      const successRateValue = recentTotal > 0 ? Math.round((recentCompleted / recentTotal) * 100) : 0;
      
      setSuccessRate({
        rate: successRateValue,
        completedCount: recentCompleted,
        totalCount: recentTotal,
        weeklyGoal: 10 // Bu değer kullanıcı tercihlerine göre ayarlanabilir
      });
    } catch (error) {
      console.warn('Başarı oranı hesaplama hatası:', error);
      setSuccessRate({
        rate: 0,
        completedCount: 0,
        totalCount: 0,
        weeklyGoal: 10
      });
    }
    
  }, [tasks]);
  
  // Yardımcı fonksiyonlar
  const getCategoryName = (categoryId: string): string => {
    // TODO: Gerçek kategori adını almak için context veya prop kullanılabilir
    return 'Kategori ' + categoryId.substring(0, 3);
  };
  
  const getCategoryColor = (name: string): string => {
    const colors = {
      'Diğer': '#94A3B8',
      'Kategori 1': '#38BDF8',
      'Kategori 2': '#A78BFA',
      'Kategori 3': '#34D399'
    };
    return (colors as any)[name] || '#94A3B8';
  };
  
  const getPriorityLabel = (priority: string): string => {
    const labels: Record<string, string> = {
      'low': 'Düşük',
      'medium': 'Orta',
      'high': 'Yüksek'
    };
    return labels[priority] || 'Belirtilmemiş';
  };
  
  const getPriorityColor = (priority: string): string => {
    const colors: Record<string, string> = {
      'low': '#10B981',
      'medium': '#F59E0B',
      'high': '#EF4444'
    };
    return colors[priority] || '#94A3B8';
  };
  
  return {
    taskStats,
    chartData,
    todayTasks,
    thisWeekTasks,
    weeklyData,
    successRate
  };
} 
import { useEffect } from 'react';

const BAIDU_TONGJI_TOKEN = '04599de77e7588461f7822ce2f5dbffc';

export default function BaiduAnalytics() {
  useEffect(() => {
    // 添加百度统计脚本
    const script = document.createElement('script');
    script.innerHTML = `
      var _hmt = _hmt || [];
      (function() {
        var hm = document.createElement("script");
        hm.src = "https://hm.baidu.com/hm.js?${BAIDU_TONGJI_TOKEN}";
        var s = document.getElementsByTagName("script")[0]; 
        s.parentNode.insertBefore(hm, s);
      })();
    `;
    document.head.appendChild(script);

    return () => {
      // 清理脚本
      document.head.removeChild(script);
    };
  }, []);

  return null;
}

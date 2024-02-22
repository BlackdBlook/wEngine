export default {
   //...
   server: {
     hmr: true,
     https:false
   },
   
  build: {
   rollupOptions: {
     output: {
       // 禁用浏览器缓存，确保每次都获取最新的代码
       manualChunks: () => 'everything.js',
     },
   },
 },
 base:'./'
}


import React from 'react';

const adHtml = `
  <html>
    <head>
      <style>body { margin: 0; overflow: hidden; display: flex; justify-content: center; }</style>
    </head>
    <body>
      <script type="text/javascript">
        atOptions = {
          'key' : '0b4f16fea4f75df34e43ce6b23bf563f',
          'format' : 'iframe',
          'height' : 250,
          'width' : 300,
          'params' : {}
        };
      </script>
      <script type="text/javascript" src="https://shaggysinner.com/0b4f16fea4f75df34e43ce6b23bf563f/invoke.js"></script>
    </body>
  </html>
`.trim();

const AdsterraBanner: React.FC = () => {
  return (
    <div className="my-12 flex flex-col items-center gap-2" aria-label="Advertisement">
      <span className="text-[10px] text-zinc-600 uppercase tracking-widest font-bold">Advertisement</span>
      <div className="bg-zinc-900/50 p-1 rounded-lg border border-zinc-800 shadow-inner">
        <iframe
          title="Advertisement"
          srcDoc={adHtml}
          width="300"
          height="250"
          scrolling="no"
          frameBorder="0"
          style={{ border: 'none', overflow: 'hidden' }}
          sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-forms allow-top-navigation-by-user-activation"
        ></iframe>
      </div>
    </div>
  );
};

export default AdsterraBanner;
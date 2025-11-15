import React from 'react';

const adHtml = `
  <html>
    <head>
      <style>body { margin: 0; overflow: hidden; }</style>
    </head>
    <body>
      <script type="text/javascript">
        atOptions = {
          'key' : '1fdfdbb2ce472537351df2f832fb5705',
          'format' : 'iframe',
          'height' : 250,
          'width' : 300,
          'params' : {}
        };
      </script>
      <script type="text/javascript" src="//sparrowcanned.com/1fdfdbb2ce472537351df2f832fb5705/invoke.js"></script>
    </body>
  </html>
`.trim();

const AdsterraBanner: React.FC = () => {
  return (
    <div className="my-8 flex justify-center" aria-label="Advertisement">
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
  );
};

export default AdsterraBanner;

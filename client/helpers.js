(function(){
  "use strict"

  // Converts urlencoded form response data to json. I got this from stackoverflow  
  module.exports.form2Json = function(str)
  {
    var obj,i,pt,keys,j,ev;
    if (typeof this.form2Json.br !== 'function')
    {
      this.form2Json.br = function(repl)
      {
        if (repl.indexOf(']') !== -1)
        {
          return repl.replace(/\](.+?)(,|$)/g,function($1,$2,$3)
                              {
                                return this.form2Json.br($2+'}'+$3);
                              });
        }
        return repl;
      };
    }
    str = '{"'+(str.indexOf('%') !== -1 ? decodeURI(str) : str)+'"}';
    obj = str.replace(/\=/g,'":"').replace(/&/g,'","').replace(/\[/g,'":{"');
    obj = JSON.parse(obj.replace(/\](.+?)(,|$)/g,function($1,$2,$3){ return this.form2Json.br($2+'}'+$3);}));
    pt = ('&'+str).replace(/(\[|\]|\=)/g,'"$1"').replace(/\]"+/g,']').replace(/&([^\[\=]+?)(\[|\=)/g,'"&["$1]$2');
    pt = (pt + '"').replace(/^"&/,'').split('&');
    for (i=0;i<pt.length;i++)
    {
      ev = obj;
      keys = pt[i].match(/(?!:(\["))([^"]+?)(?=("\]))/g);
      for (j=0;j<keys.length;j++)
      {
        if (!ev.hasOwnProperty(keys[j]))
        {
          if (keys.length > (j + 1))
          {
            ev[keys[j]] = {};
          }
          else
          {
            ev[keys[j]] = pt[i].split('=')[1].replace(/"/g,'');
            break;
          }
        }
        ev = ev[keys[j]];
      }
    }
    return obj;
  };

  module.exports.random = function(seed){
    var x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };

  // Merges two hashes
  module.exports.merge = function(obj1,obj2){
    for (var p in obj2) {
      try {
        // Property in destination object set; update its value.
        if ( obj2[p].constructor==Object ) {
          obj1[p] = this.merge(obj1[p], obj2[p]);

        } else {
          obj1[p] = obj2[p];

        }

      } catch(e) {
        // Property in destination object not set; create it and set its value.
        obj1[p] = obj2[p];

      }
    }

    return obj1;
  };
})();



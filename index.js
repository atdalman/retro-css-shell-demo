import './src/styles.scss';
import {terminal} from './src/terminal.js';
import './src/generator.js';

/**
 * Copyright (c) 2011-2018, Anders Evenrud <andersevenrud@gmail.com>
 * Copyright (c) 2020, Aaron Dalman <atdalman@gmail.com>
 * 
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
 * ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

// Banner text
const banner = `
.............................................................................

'||''|.                    '||      '||          
 ||   ||    ...   ... ...   || ...   ||    ....  
 ||    || .|  '|.  ||  ||   ||'  ||  ||  .|...|| 
 ||    || ||   ||  ||  ||   ||    |  ||  ||      
.||...|'   '|..|'  '|..'|.  '|...'  .||.  '|...' 
                                                 
                                                 
'||'  '||'         '||   ||                      
 ||    ||    ....   ||  ...  ... ...             
 ||''''||  .|...||  ||   ||   '|..'              
 ||    ||  ||       ||   ||    .|.               
.||.  .||.  '|...' .||. .||. .|  ||.             
                                                 
                                                 
NPC generator and lookup tool for the TTRPG, Mothership.  Type 'help' to view menu.
`;

// Help text
const helpText = `
Available commands:

help - This output
mon - Generates a non-human, non-android species
mon <#> - Recalls a previously generated non-human, non-android species
hum - Generates a human/android npc
hum <#> - Recalls a previously generated human/android npc
contact - Prints contact information
clear - Clears the display
`;

const testMon = {
  size: 'large',
  fangs: 'sharp',
  shirt: 'pressed'
};

// Contact texts
const contactInfo = {
  email: 'atdalman@gmail.com',
  github: 'https://github.com/atdalman'
};

const contactList = Object.keys(contactInfo)
  .reduce((result, key) => result.concat([`${key} - ${contactInfo[key]}`]), [])
  .join('\n');

const contactText = `
Created by Aaron Dalman

${contactList}`;

const openContact = key => window.open(key === 'email'
  ? `mailto:${contactInfo[key]}`
  : contactInfo[key]);

// File browser
const browser = (function() {
  let current = '/';

  let tree = [{
    location: '/',
    filename: 'documents',
    type: 'directory'
  }, {
    location: '/',
    filename: 'AUTHOR',
    type: 'file',
    content: 'Aaron Dalman <atdalman@gmail.com>'
  }];

  const fix = str => str.trim().replace(/\/+/g, '/') || '/';

  const setCurrent = dir => {
    if (typeof dir !== 'undefined') {
      if (dir == '..') {
        const parts = current.split('/');
        parts.pop();
        current = fix(parts.join('/'));
      } else {
        const found = tree.filter(iter => iter.location === current)
          .find(iter => iter.filename === fix(dir));

        if (found) {
          current = fix(current + '/' + dir);
        } else {
          return `Directory '${dir}' not found in '${current}'`;
        }
      }

      return `Entered '${current}'`;
    }

    return current;
  };

  const ls = () => {
    const found = tree.filter(iter => iter.location === current);
    const fileCount = found.filter(iter => iter.type === 'file').length;
    const directoryCount = found.filter(iter => iter.type === 'directory').length;
    const status = `${fileCount} file(s), ${directoryCount} dir(s)`;
    const maxlen = Math.max(...found.map(iter => iter.filename).map(n => n.length));

    const list = found.map(iter => {
      return `${iter.filename.padEnd(maxlen + 1, ' ')} <${iter.type}>`;
    }).join('\n');

    return `${list}\n\n${status} in ${current}`;
  };

  const cat = filename => {
    const found = tree.filter(iter => iter.location === current);
    const foundFile = found.find(iter => iter.filename === filename);

    if (foundFile) {
      return foundFile.content;
    }

    return `File '${filename}' not found in '${current}'`;
  };

  return {
    cwd: () => setCurrent(),
    cd: dir => setCurrent(fix(dir)),
    cat,
    ls
  };
})();

///////////////////////////////////////////////////////////////////////////////
// MAIN
///////////////////////////////////////////////////////////////////////////////

const load = () => {
  const t = terminal({
    prompt: () => `$ ${browser.cwd()} > `,
    banner,
    commands: {
      help: () => helpText,
      //mon: () => genMonster(),
      //hum: () => genHuman(),
      cwd: () => browser.cwd(),
      cd: dir => browser.cd(dir),
      ls: () => browser.ls(),
      cat: file => browser.cat(file),
      clear: () => t.clear(),
      contact: (key) => {
        if (key in contactInfo) {
          openContact(key);
          return `Opening ${key} - ${contactInfo[key]}`;
        }

        return contactText;
      },
      mon: () => testMon
      
    }
  });
};

document.addEventListener('DOMContentLoaded', load);

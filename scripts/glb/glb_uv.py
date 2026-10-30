import json,struct,sys,numpy as np
def load(f):
    b=open(f,'rb').read(); n=struct.unpack('<I',b[12:16])[0]; j=json.loads(b[20:20+n]); return j, b[20+n+8:]
def uv(j,binc,i):
    a=j['accessors'][i]; bv=j['bufferViews'][a['bufferView']]; st=bv.get('byteStride',8)
    raw=np.frombuffer(binc,np.uint8,bv['byteLength'],bv.get('byteOffset',0))
    off=a.get('byteOffset',0)
    return np.lib.stride_tricks.as_strided(raw[off:].view(np.float32) if st==8 else raw[off:], shape=(a['count'],2), strides=(st,4)) if st==8 else None
if __name__=='__main__':
    j,binc=load(sys.argv[1])
    for nd in j['nodes']:
        if 'mesh' not in nd: continue
        for pi,p in enumerate(j['meshes'][nd['mesh']]['primitives'][:3]):
            s=[]
            for k in sorted(a for a in p['attributes'] if a.startswith('TEXCOORD')):
                u=uv(j,binc,p['attributes'][k])
                s.append((k, u.min(0).round(2).tolist(), u.max(0).round(2).tolist()))
            print(nd['name'],pi,s)

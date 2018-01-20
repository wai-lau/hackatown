import os
from flask import Flask, render_template, url_for, send_file
import subprocess
import re
from zipfile import ZipFile
import zipfile
import threading

class AsyncZip(threading.Thread):
        def __init__(self, infile, outfile):
                threading.Thread.__init__(self)
                self.infile = infile
                self.outfile = outfile
        def run(self):
                os.chdir(r'/k8slogs/')
                f = zipfile.ZipFile(self.outfile, 'w', zipfile.ZIP_DEFLATED)
                f.write(self.infile)
                os.chdir(r'/nlps-dynamic-inventory/')
                f.close()

def downloadPod(name, path, mode, container=""):
        if container:
            pathCont = path+"-"+container
        else:
            pathCont = path

        os.chdir(r'/k8slogs/')
        filelist = [ f for f in os.listdir(".") ]
        for f in filelist:
            os.remove(f)

        #here the data is collected
        if mode != 'desc':
            f = open(pathCont+".txt", "w")
            sp = subprocess.Popen(["/usr/local/bin/kubectl", "-s", "http://mt-dmz-k8s-master01:8080", "--namespace="+name, "logs", path, container], stdout=f, stderr=f)
            #log=url_for('download_log', rc = rc, pod = pod, container = container)
            os.chdir(r'/nlps-dynamic-inventory/')
            sp.wait()
        else:
            f = open(path+".txt", "w")
            sp = subprocess.Popen(["/usr/local/bin/kubectl", "-s", "http://mt-dmz-k8s-master01:8080", "--namespace="+name, "describe", "pod", path], stdout=f, stderr=f)
            #log=url_for('download_log', rc = rc, pod = pod, container = container)
            os.chdir(r'/nlps-dynamic-inventory/')
            sp.wait()


        #here are the download modes
        if mode == 'text':
            try:
                    return send_file('/k8slogs/'+pathCont+".txt", attachment_filename=pathCont+'.txt')
            except Exception as e:
                    return str(e)
        elif mode == 'desc':
            try:
                    return send_file('/k8slogs/'+path+".txt", attachment_filename=pathCont+'.txt')
            except Exception as e:
                    return str(e)
        else:
            background = AsyncZip(pathCont+".txt", pathCont+'.zip')
            background.start()
            background.join()
            os.chdir(r'/nlps-dynamic-inventory/')
            try:
                    return send_file('/k8slogs/'+pathCont+".zip", attachment_filename=pathCont+'.zip')
            except Exception as e:
                    return str(e)

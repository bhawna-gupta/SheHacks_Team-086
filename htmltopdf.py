import sys
import pdfkit

inputfile = sys.argv[1]

outputfile = sys.argv[2]

pdfkit.from_file(inputfile, outputfile)

print("html to pdf converted")



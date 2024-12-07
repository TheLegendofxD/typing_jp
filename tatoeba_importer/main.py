# Please place the "jpn_sentences_detailed.tsv" downloaded from
# https://tatoeba.org/en/downloads into this folder and execute
# this script. By changing the value of MIN_LENGTH in line 15
# you can change the minimum length a sentence must have to be
# added to your sentence list. After the program ran, you must
# put the file into the assets folder. The file name "sentences.txt"
# must be kept. From then on, sentences will  be loaded from
# this new file instead. Important is, that this converter
# expects the detailed version of the sentence file from
# tatoeba.org to include the proper credits.
import re
import pykakasi
from tqdm import tqdm

MIN_LENGTH = 40

def kanji_to_hiragana(text):
    kakasi = pykakasi.kakasi()
    result = kakasi.convert(text)
    return ''.join([item['hira'] for item in result])

def is_japanese_text(string):
    pattern = r'^[\u3040-\u309F\u4E00-\u9FFF\u3000-\u303F、。！？「」（）ー]*$'
    return bool(re.fullmatch(pattern, string))

with open('jpn_sentences_detailed.tsv', encoding='utf-8') as f:
    data = f.readlines()

output = []
for line in tqdm(data):
    line = line.split('\t')
    if not is_japanese_text(line[2]):
        continue
    converted = kanji_to_hiragana(line[2])
    if len(converted) < MIN_LENGTH: continue
    # I think you need an IME to type those so I'll have to remove them for now
    converted = converted.replace('！','。')
    converted = converted.replace('？','。')
    output.append(f'{converted},{line[3]}')

with open('sentences.txt','w', encoding='utf-8') as f:
    f.write('\n'.join(output))

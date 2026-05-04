with open("apps/frontend/src/components/GameFooter.tsx", "r") as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "delay: 0.3," in line:
        lines.insert(i + 2, '                className="absolute bottom-0 left-0 right-0 flex items-center justify-between bg-[#121214]/80 backdrop-blur-md shadow-black/30 shadow-lg rounded-lg px-4 py-3 pointer-events-auto"\n')
        break

with open("apps/frontend/src/components/GameFooter.tsx", "w") as f:
    f.writelines(lines)
print("done")

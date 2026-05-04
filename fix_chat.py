import re

with open("apps/frontend/src/components/GameFooter.tsx", "r") as f:
    content = f.read()

# Replace the empty spot between {/* Chat Button */} and {/* Participants Button */}
target = """                    {/* Chat Button */}


                    {/* Participants Button */}"""

replacement = """                    {/* Chat Button */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="default"
                                size="sm"
                                className={`cursor-pointer transition-all ease-in-out ${
                                    showChat 
                                        ? "bg-indigo-600 border-indigo-500" 
                                        : "bg-indigo-500 hover:bg-indigo-400 border-indigo-400"
                                }`}
                                onClick={() => setShowChat(!showChat)}
                            >
                                <MessageCircle className="w-4 h-4 text-white" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p className="text-black">
                                {showChat ? "Hide Chat" : "Show Chat"}
                            </p>
                        </TooltipContent>
                    </Tooltip>

                    {/* Participants Button */}"""

new_content = content.replace(target, replacement)

with open("apps/frontend/src/components/GameFooter.tsx", "w") as f:
    f.write(new_content)

print("done")

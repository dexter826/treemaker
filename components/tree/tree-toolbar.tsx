import { useStore } from '../../lib/store';
import { Button } from '../ui/button';
import { ZoomIn, ZoomOut, Maximize, Search, Share2, ArrowLeft, Check } from 'lucide-react';
import { useReactFlow } from '@xyflow/react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../ui/command';
import { useState } from 'react';

export function TreeToolbar() {
  const currentTree = useStore(state => state.currentTree);
  const persons = useStore(state => state.persons);
  const setSelectedPersonId = useStore(state => state.setSelectedPersonId);
  const { zoomIn, zoomOut, fitView, setCenter, getNode } = useReactFlow();
  
  const [searchOpen, setSearchOpen] = useState(false);

  if (!currentTree) return null;

  const handleShare = () => {
    const url = `${window.location.origin}/share/${currentTree.share_token}`;
    navigator.clipboard.writeText(url);
    toast.success('Share link copied to clipboard!');
  };

  const focusPerson = (id: string) => {
    setSearchOpen(false);
    setSelectedPersonId(id);
    // Focus node is handled in family-tree-canvas useEffect, but we could also do it here.
  };

  return (
    <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
      <div className="bg-background/80 backdrop-blur-md border shadow-sm rounded-lg p-1.5 flex items-center gap-1">
        <Link href="/">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div className="w-px h-6 bg-border mx-1" />
        <h1 className="font-semibold px-2 text-sm max-w-[150px] truncate">{currentTree.name}</h1>
      </div>

      <div className="bg-background/80 backdrop-blur-md border shadow-sm rounded-lg p-1.5 flex items-center gap-1">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => zoomIn({ duration: 300 })}>
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => zoomOut({ duration: 300 })}>
          <ZoomOut className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => fitView({ duration: 800, padding: 0.2 })}>
          <Maximize className="w-4 h-4" />
        </Button>
      </div>

      <div className="bg-background/80 backdrop-blur-md border shadow-sm rounded-lg p-1.5 flex items-center gap-1">
        <Popover open={searchOpen} onOpenChange={setSearchOpen}>
          <PopoverTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 w-8">
            <Search className="w-4 h-4" />
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0" align="start">
            <Command>
              <CommandInput placeholder="Search person..." />
              <CommandList>
                <CommandEmpty>No person found.</CommandEmpty>
                <CommandGroup>
                  {persons.map((person) => (
                    <CommandItem
                      key={person.id}
                      value={`${person.first_name} ${person.last_name}`}
                      onSelect={() => focusPerson(person.id)}
                    >
                      <Check className="mr-2 h-4 w-4 opacity-0" />
                      {person.first_name} {person.last_name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        <Button variant="default" size="sm" className="h-8 gap-2 ml-1" onClick={handleShare}>
          <Share2 className="w-3.5 h-3.5" />
          Share
        </Button>
      </div>
    </div>
  );
}

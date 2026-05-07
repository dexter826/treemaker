import { useStore } from '../../lib/store';
import { Button } from '../ui/button';
import { Search, Share2, ArrowLeft, Check, UserPlus } from 'lucide-react';

import Link from 'next/link';
import { toast } from 'sonner';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../ui/command';
import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { personService } from '../../lib/services/person.service';

export function TreeToolbar() {
  const currentTree = useStore(state => state.currentTree);
  const persons = useStore(state => state.persons);
  const setSelectedPersonId = useStore(state => state.setSelectedPersonId);
  
  
  const [searchOpen, setSearchOpen] = useState(false);
  const [isAddPersonOpen, setIsAddPersonOpen] = useState(false);
  const [newPersonName, setNewPersonName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const addPerson = useStore(state => state.addPerson);

  if (!currentTree) return null;

  const handleShare = () => {
    const url = `${window.location.origin}/share/${currentTree.share_token}`;
    navigator.clipboard.writeText(url);
    toast.success('Đã sao chép khóa chia sẻ!');
  };

  const focusPerson = (id: string) => {
    setSearchOpen(false);
    setSelectedPersonId(id);
  };

  const handleAddPerson = async () => {
    if (!newPersonName.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const newPerson = await personService.create({
        tree_id: currentTree.id,
        full_name: newPersonName.trim() || 'Khuyết Danh',
        gender: 'other'
      });
      addPerson(newPerson);
      setSelectedPersonId(newPerson.id);
      setIsAddPersonOpen(false);
      setNewPersonName('');
      toast.success('Đã thêm hồ sơ mới!');
    } catch (err: any) {
      toast.error('Lỗi: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="absolute top-6 left-6 z-10 flex flex-col md:flex-row items-start md:items-center gap-4">
      {/* Title Block */}
      <div className="bg-background border-2 border-foreground flex items-stretch shadow-[4px_4px_0px_0px_var(--color-foreground)]">
        <Link href="/" className="flex items-center justify-center border-r-2 border-foreground hover:bg-foreground hover:text-background transition-colors w-12">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="px-4 py-2 flex flex-col justify-center">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Hồ Sơ Hiện Tại</span>
          <h1 className="font-serif font-black text-lg uppercase tracking-tight max-w-[200px] truncate">{currentTree.name}</h1>
        </div>
      </div>

      {/* Action Block */}
      <div className="bg-background border-2 border-foreground flex items-center shadow-[4px_4px_0px_0px_var(--color-foreground)]">
        <Popover open={searchOpen} onOpenChange={setSearchOpen}>
          <PopoverTrigger className="h-12 w-12 rounded-none border-r-2 border-foreground hover:bg-foreground hover:text-background flex items-center justify-center transition-colors">
            <Search className="w-5 h-5" />
          </PopoverTrigger>
          <PopoverContent className="w-[280px] p-0 border-2 border-foreground rounded-none shadow-[4px_4px_0px_0px_var(--color-foreground)]" align="start">
            <Command className="rounded-none">
              <CommandInput placeholder="Tìm kiếm cá nhân..." className="border-none focus:ring-0" />
              <CommandList>
                <CommandEmpty>Không tìm thấy.</CommandEmpty>
                <CommandGroup>
                  {persons.map((person) => (
                    <CommandItem
                      key={person.id}
                      value={person.full_name}
                      onSelect={() => focusPerson(person.id)}
                      className="rounded-none cursor-pointer aria-selected:bg-primary/10 aria-selected:text-primary font-bold uppercase tracking-widest text-xs py-3"
                    >
                      <Check className="mr-2 h-4 w-4 opacity-0" />
                      {person.full_name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        <Button 
          variant="ghost" 
          className="h-12 px-4 rounded-none font-bold uppercase tracking-widest text-xs gap-2 hover:bg-primary hover:text-primary-foreground" 
          onClick={handleShare}
        >
          <Share2 className="w-4 h-4" />
          <span>Chia sẻ</span>
        </Button>

        <Button 
          variant="ghost" 
          className="h-12 px-4 rounded-none font-bold uppercase tracking-widest text-xs gap-2 hover:bg-primary hover:text-primary-foreground" 
          onClick={() => setIsAddPersonOpen(true)}
        >
          <UserPlus className="w-4 h-4" />
          <span>Thêm người</span>
        </Button>
      </div>

      <Dialog open={isAddPersonOpen} onOpenChange={(v) => { if (!v) { setIsAddPersonOpen(false); setNewPersonName(''); } }}>
        <DialogContent className="border-2 border-foreground rounded-none shadow-[8px_8px_0px_0px_var(--color-foreground)] bg-background p-0 sm:max-w-md">
          <div className="border-b-2 border-foreground bg-primary/5 p-6">
            <DialogTitle className="font-serif font-black text-2xl uppercase tracking-widest">
              Thêm Hồ Sơ Mới
            </DialogTitle>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mt-2">
              Vào cây: {currentTree.name}
            </p>
          </div>
          
          <div className="space-y-4 p-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-[0.2em]">Họ và Tên</Label>
              <Input 
                autoFocus
                value={newPersonName} 
                onChange={e => setNewPersonName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddPerson()}
                placeholder="Nhập tên người mới"
                className="rounded-none border-2 border-foreground focus:border-primary focus:ring-0 h-12 font-bold"
              />
            </div>
          </div>
          
          <div className="border-t-2 border-foreground p-0 flex">
            <Button variant="ghost" className="flex-1 rounded-none h-14 border-r-2 border-foreground font-bold uppercase tracking-widest hover:bg-foreground hover:text-background cursor-pointer" onClick={() => { setIsAddPersonOpen(false); setNewPersonName(''); }}>
              Hủy
            </Button>
            <Button className="flex-1 rounded-none h-14 bg-primary hover:bg-foreground text-background font-bold uppercase tracking-widest cursor-pointer" onClick={handleAddPerson} disabled={!newPersonName.trim() || isSubmitting}>
              {isSubmitting ? 'Đang thêm...' : 'Ghi Nhận'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

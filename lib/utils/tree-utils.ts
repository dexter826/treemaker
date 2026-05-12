import { Person, Relationship } from '@/types';

// Sắp xếp danh sách thành viên theo logic dòng dõi (DFS).
export function getOrderedPersons(persons: Person[], relationships: Relationship[]): Person[] {
  const ordered: Person[] = [];
  const visited = new Set<string>();

  const spousesOf = new Map<string, string[]>();
  const childrenOf = new Map<string, string[]>();

  relationships.forEach(rel => {
    if (rel.relationship_type === 'spouse') {
      const s1 = spousesOf.get(rel.person1_id) || [];
      if (!s1.includes(rel.person2_id)) s1.push(rel.person2_id);
      spousesOf.set(rel.person1_id, s1);

      const s2 = spousesOf.get(rel.person2_id) || [];
      if (!s2.includes(rel.person1_id)) s2.push(rel.person1_id);
      spousesOf.set(rel.person2_id, s2);
    }
  });

  persons.forEach(p => {
    if (p.father_id) {
      const children = childrenOf.get(p.father_id) || [];
      if (!children.includes(p.id)) children.push(p.id);
      childrenOf.set(p.father_id, children);
    }
    if (p.mother_id) {
      const children = childrenOf.get(p.mother_id) || [];
      if (!children.includes(p.id)) children.push(p.id);
      childrenOf.set(p.mother_id, children);
    }
  });

  const sortPersons = (ids: string[]) => {
    return ids.map(id => persons.find(p => p.id === id)!)
      .filter(Boolean)
      .sort((a, b) => {
        if (a.sibling_order !== null && b.sibling_order !== null) {
          return a.sibling_order - b.sibling_order;
        }
        if (a.sibling_order !== null) return -1;
        if (b.sibling_order !== null) return 1;
        
        const dateA = a.birth_date || '9999';
        const dateB = b.birth_date || '9999';
        if (dateA !== dateB) return dateA.localeCompare(dateB);

        if (a.gender === 'male' && b.gender === 'female') return -1;
        if (a.gender === 'female' && b.gender === 'male') return 1;
        
        return 0;
      });
  };

  const traverse = (personId: string) => {
    if (visited.has(personId)) return;

    const person = persons.find(p => p.id === personId);
    if (!person) return;

    visited.add(personId);
    ordered.push(person);

    const spouses = spousesOf.get(personId) || [];
    spouses.forEach(sId => {
      if (visited.has(sId)) return;
      
      const spouse = persons.find(p => p.id === sId);
      if (spouse) {
        visited.add(sId);
        ordered.push(spouse);

        const pChildren = childrenOf.get(personId) || [];
        const sChildren = childrenOf.get(sId) || [];
        const commonChildren = pChildren.filter(id => sChildren.includes(id));
        
        sortPersons(commonChildren).forEach(child => traverse(child.id));
      }
    });

    const allChildren = childrenOf.get(personId) || [];
    const remainingChildren = allChildren.filter(id => !visited.has(id));
    sortPersons(remainingChildren).forEach(child => traverse(child.id));
  };

  const potentialRoots = persons.filter(p => !p.father_id && !p.mother_id);
  
  const trueRoots = potentialRoots.filter(p => {
    const spouses = spousesOf.get(p.id) || [];
    const isMarriedToNonRoot = spouses.some(sId => {
      const spouse = persons.find(ps => ps.id === sId);
      return spouse && (spouse.father_id || spouse.mother_id);
    });
    return !isMarriedToNonRoot;
  });

  const rootsWithChildren = trueRoots.filter(p => childrenOf.has(p.id));
  const finalRoots = rootsWithChildren.length > 0 ? rootsWithChildren : trueRoots;

  sortPersons(finalRoots.map(r => r.id)).forEach(root => traverse(root.id));

  persons.forEach(p => {
    if (!visited.has(p.id)) traverse(p.id);
  });

  return ordered;
}

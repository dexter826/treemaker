export { PersonForm } from './components/person-form';
export { ViewPersonModal } from './components/view-person-modal';
export { PersonCardActions } from './components/person-card-actions';
export { personService, type RelationType } from './services/person.service';
export {
  personSchema,
  addPersonSchema,
  type PersonFormValues,
  type AddPersonFormValues,
} from './validations/person';
export {
  isDeceased,
  calculateAge,
  formatDate,
  hasSiblingOrderConflict,
} from './utils/person-utils';

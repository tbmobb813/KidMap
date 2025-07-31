// types/category.ts

export type CategoryIcon =
  | 'home'
  | 'school'
  | 'park'
  | 'library'
  | 'store'
  | 'food-pizza'
  | 'food-burger'
  | 'food-icecream'
  | 'friend'
  | 'family'
  | 'custom'

export interface Category {
  id: string
  name: string
  icon: CategoryIcon
  createdBy: 'parent' | 'child'
  approved?: boolean // for parent approval
  createdAt: number
}

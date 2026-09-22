/**
 * 页面状态管理
 */
import { defineStore } from 'pinia'
import * as spaceApi from '@/api/space'
import { createPageState } from '@/utils/pageState'

export const usePageStore = defineStore('page', () => createPageState(spaceApi))

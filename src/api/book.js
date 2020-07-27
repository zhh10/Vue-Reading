import request from '@/utils/request'

// 上传电子书
export function createBook(book) {
  return request({
    url: '/book/create',
    method: 'post',
    data: book
  })
}

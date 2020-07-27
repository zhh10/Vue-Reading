<template>
  <div class="upload-container">
    <el-upload
      :action="action"
      :headers="headers"
      :multiple="multiple"
      :file-list="fileList"
      :limit="limit"
      :before-upload="beforeUpload"
      :on-exceed="onExceed"
      :on-success="onSuccess"
      :on-error="onError"
      :on-remove="onRemove"
      :accept="accept"
      drag
      show-file-list
      style="width:100%;height:270px;overflow:hidden"
      class="image-upload"
    >
      <i class="el-icon-upload" />
      <div v-if="fileList.length === 0" class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
      <div v-else class="el-upload__text">图片已上传</div>
    </el-upload>
  </div>
</template>
<script>
import { getToken } from '../../utils/auth'

export default {
  data() {
    return {
      multiple: false,
      fileList: [],
      accept: 'application/epub+zip',
      limit: 1,
      action: `${process.env.VUE_APP_BASE_API}/book/upload`,
      postForm: {}
    }
  },
  computed: {
    headers() {
      return {
        Authorization: `Bearer ${getToken()}`
      }
    }
  },
  methods: {
    beforeUpload(file) {

    },
    onError(err, file, fileList) {

    },
    onSuccess(res, file, fileList) {
      const { data, code } = res

      if (code === 0) {
        // 上传成功
        this.$message({
          message: '电子书上传成功',
          type: 'success'
        })

        this.$emit('handleSuccess', data)
        this.fileList = [{ name: file.name, url: res.data.url }]
      } else {
        this.$message({
          message: '电子书上传失败',
          type: 'warning'
        })
      }
    },
    onRemove(file, fileList) {
      this.fileList = []
      this.$emit('handleRemove')
    },
    onExceed(file, fileList) {
      this.$message({
        message: '每次只能上传一本电子书',
        type: 'warning'
      })
    }

  }
}

</script>

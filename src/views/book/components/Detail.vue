<template>
  <el-form ref="postForm" :model="postForm" :rules="rules">
    <sticky :class-name="'sub-navbar'">
      <el-button v-if="!isEdit">显示帮助</el-button>
      <el-button
        style="margin-left:10px"
        type="success"
        :loading="isLoading"
        @click="submitForm"
      >{{ isEdit?"编辑电子书":"新增电子书" }}</el-button>
    </sticky>
    <div class="detail-container">
      <el-row>
        <Warning />
        <el-col :span="24">
          <ebook-upload
            @handleSuccess="handleSuccess($event)"
            @handleRemove="handleRemove"
          />
        </el-col>
        <el-col :span="24">
          <el-form-item prop="title">
            <MdInput v-model="postForm.title" :maxlength="100" name="name" required>
              书名
            </MdInput>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item
            prop="author"
            label="作者"
            :label-width="labelWidth"
          >
            <el-input v-model="postForm.author" placeholder="请输入作者名" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item prop="publisher" label="出版社" :label-width="labelWidth">
            <el-input v-model="postForm.publisher" placeholder="出版社" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item prop="language" label="语言" :label-width="labelWidth">
            <el-input v-model="postForm.language" placeholder="语言" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item prop="rootFile" label="根文件" :label-width="labelWidth">
            <el-input v-model="postForm.rootFile" placeholder="跟文件" disabled />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item prop="filePath" label="文件路径" :label-width="labelWidth">
            <el-input v-model="postForm.filePath" placeholder="文件路径" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item prop="unzipPath" label="解压路径" :label-width="labelWidth">
            <el-input v-model="postForm.unzipPath" placeholder="解压路径" disabled />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item prop="coverPath" label="封面路径" :label-width="labelWidth">
            <el-input v-model="postForm.filePath" placeholder="封面路径" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item prop="originName" label="文件名称" :label-width="labelWidth">
            <el-input v-model="postForm.unzipPath" placeholder="文件名称" disabled />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item prop="cover" label="封面" :label-width="labelWidth">
            <a v-if="postForm.cover" :href="postForm.cover" target="_blank">
              <img :src="postForm.cover" class="preview-img">
            </a>
            <span v-else>无</span>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="目录" :label-width="labelWidth">

            <div v-if="postForm.contentsTree && postForm.contentsTree.length > 0" class="contents-wrapper">
              <el-tree
                :data="postForm.contentsTree"
                @node-click="handleNodeClick"
              />

            </div>
            <span v-else>无</span>
          </el-form-item>
        </el-col>
      </el-row>
    </div>
  </el-form>
</template>

<script>
import sticky from '@/components/Sticky'
import Warning from './Warning'
import EbookUpload from '@/components/EbookUpload'
import MdInput from '../../../components/MDinput'
import { createBook } from '../../../api/book'
export default {
  components: {
    sticky,
    Warning,
    EbookUpload,
    MdInput
  },
  props: {
    isEdit: {
      type: Boolean
    }
  },
  data() {
    const validateRequire = (rule, value, callback) => {
      if (value.length === 0) {
        callback(new Error(rule.field + '必须填写'))
      } else {
        callback()
      }
    }
    return {
      isLoading: false,
      contentTree: [],
      labelWidth: '120px',
      postForm: {},
      rules: {
        title: [{ validator: validateRequire }],
        author: [{ validator: validateRequire }],
        publisher: [{ validator: validateRequire }],
        language: [{ validator: validateRequire }]
      }
    }
  },
  methods: {
    setData(val) {
      this.postForm = Object.assign({}, val)
    },
    handleSuccess(data) {
      this.setData(data)
    },
    handleRemove() {
      this.setData({})
      this.$refs.postForm.resetFields()
    },
    handleNodeClick(data) {
      window.open(data.text)
    },
    submitForm() {
      const onSuccess = (response) => {

      }
      if (!this.isLoading) {
        this.isLoading = true
        this.$refs.postForm.validate((valid, fields) => {
          if (valid) {
            // 如果通过了验证
            const book = Object.assign({}, this.postForm)
            delete book.contentsTree
            if (!this.isEdit) {
              // 如果不是编辑状态
              // 那么就新增电子书
              createBook(book)
            }
          }
        })
      }
    }
  }
}
</script>

<style scoped>
    .detail-container{
        padding:40px 50px 20px;
    }
    .preview-img{
        width:150px;
        height:200px;
    }
</style>

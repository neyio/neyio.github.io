# Docker 关于镜像推送至阿里云私有云

> 修改于 2019 年 4 月 26 日 下午 4:11

#技术文档/Docker 容器

## 阿里云相关操作

> 具体链接请登入阿里云控制台后，进入镜像容器服务，选择任意镜像仓库，点击仓库名，可见如下内容。

### 1.登录阿里云 Docker Registry

```bash
$ sudo docker login —username=账号 registry.cn-beijing.aliyuncs.com
```

用于登录的用户名为阿里云账号全名，密码为开通服务时设置的密码。
你可以在产品控制台首页修改登录密码。

### 2.从 Registry 中拉取镜像

```bash
$ sudo docker pull registry.cn-beijing.aliyuncs.com/路径/egg-full-demo:[镜像版本号]
```

### 3.将镜像推送到 Registry

```bash
$ sudo docker login —username=账号 registry.cn-beijing.aliyuncs.com
$ sudo docker tag [ImageId] registry.cn-beijing.aliyuncs.com/路径/egg-full-demo:[镜像版本号]
$ sudo docker push registry.cn-beijing.aliyuncs.com/路径/egg-full-demo:[镜像版本号]
```

请根据实际镜像信息替换示例中的[ImageId]和[镜像版本号]参数。

### 4.选择合适的镜像仓库地址

从 ECS 推送镜像时，可以选择使用镜像仓库内网地址。推送速度将得到提升并且将不会损耗您的公网流量。
如果您使用的机器位于 VPC 网络，请使用`registry-vpc.cn-beijing.aliyuncs.com`作为 Registry 的域名登录，并作为镜像命名空间前缀。

### 5.示例

使用`docker tag`命令重命名镜像，并将它通过专有网络地址推送至 Registry。

```bash
$ sudo docker images
REPOSITORY                                                         TAG                 IMAGE ID            CREATED             VIRTUAL SIZE
registry.aliyuncs.com/acs/agent                                    0.7-dfb6816         37bb9c63c8b2        7 days ago          37.89 MB
$ sudo docker tag 37bb9c63c8b2 registry-vpc.cn-beijing.aliyuncs.com/acs/agent:0.7-dfb68163
# 使用”docker images”命令找到镜像，将该镜像名称中的域名部分变更为Registry专有网络地址。
$ sudo docker push registry-vpc.cn-beijing.aliyuncs.com/acs/agent:0.7-dfb6816
```

---
slug: spring-boot-extension-interface.md
title: 优雅代码实现：Spring Boot 的 7 个扩展接口
date: 2025-03-10 22:20:00
authors: yuluo
tags: [Spring Boot]
keywords: [Spring Boot Extension]
---

<!-- truncate -->

在使用 Spring Boot 构建 Web 应用程序时，需要在 web 容器的不同生命时期，执行不同的代码逻辑。Spring Boot 框架提供了许多扩展点，能够让开发者优雅地定制和增强应用。这些扩展接口不仅能帮助我们解决常见问题，还能让代码更加优雅、灵活。

## 1. ApplicationRunner：启动任务优雅执行

当 Spring Boot 应用启动完成后，有时需要执行一些初始化任务。例如 Spring AI Alibaba 中的向量数据初始化，临时目录文件创建等。在 Spring Boot 框架中提供了 ApplicationRunner 接口以优雅的方式来实现这一点。

> 例如在如下代码中，完成两个临时目录的创建，并在 web 容器停止时，使用 `@PreDestroy` 删除临时文件目录。

```java
@Component
public class TmpFolderConfig implements ApplicationRunner {

	private static final String ImageTmpFolder = "tmp/image";

	private static final String AudioTmpFolder = "tmp/audio";

	@Override
	public void run(ApplicationArguments args) throws Exception {

		logger.info("Init tmp folder");

		FilesUtils.initTmpFolder(System.getProperty("user.dir") + "/" + ImageTmpFolder);
		FilesUtils.initTmpFolder(System.getProperty("user.dir") + "/" +AudioTmpFolder);

		logger.info("Init tmp folder");
	}

	@PreDestroy
	public void destroy() {

		FilesUtils.deleteDirectory(new File(System.getProperty("user.dir") + "/" +ImageTmpFolder));
		FilesUtils.deleteDirectory(new File(System.getProperty("user.dir") + "/" +AudioTmpFolder));
		FilesUtils.deleteDirectory(new File(System.getProperty("user.dir") + "/" +"tmp"));

		logger.info("Delete tmp folder");
	}

}
```

## 2. CommandLineRunner：命令行任务执行利器

和 ApplicationRunner 类似，CommandLineRunner 也用于应用启动后执行初始化任务，但它直接接收启动参数为字符串数组。

```java
@Component
@Order(1) // 指定执行顺序，数字越小优先级越高
public class SpringBootRuntime implements CommandLineRunner {

	@Override
	public void run(String... args) throws Exception {

		boolean flag = Arrays.asList(args).contains("flag");
		if (flag) {
			System.out.println("flag is true. to do something");
		} else {
			System.out.println("flag is false...");
		}
	}
}
```

## 3. ApplicationContextInitializer：上下文初始化好帮手

ApplicationContextInitializer 可以在 Spring 应用上下文刷新之前执行一些定制化操作，特别适合进行环境相关的配置修改。

```java
public class SpringBootRuntime implements ApplicationContextInitializer<ConfigurableApplicationContext> {

	@Override
	public void initialize(ConfigurableApplicationContext applicationContext) {

		// 在 Spring 上下文刷新前执行
		// 可以修改或增强 Spring 上下文的配置
		ConfigurableEnvironment environment = applicationContext.getEnvironment();

		// 例如，添加一个自定义的属性源
		environment.getPropertySources().addFirst(
				new MapPropertySource(
						"CustomProperties",
						Collections.singletonMap("indi.yuluo.app.data.init.enabled", "true")
				)
		);

		System.out.println("应用上下文初始化器添加了自定义属性源");
	}
}
```

之后通过 `META-INF/spring.factories` 中注册或者在应用启动时注册：

1. 在 spring.factories 中注册	

   ```java
   org.springframework.context.ApplicationContextInitializer=\
   com.example.SpringBootRuntime
   ```

2. 在应用启动时注册

   ```java
   @SpringBootApplication
   public class Main {
   	public static void main(String[] args) {
   
   		SpringApplication app = new SpringApplication(Main.class);
   
   		// 手动添加 ApplicationContextInitializer
   		app.addInitializers((ApplicationContextInitializer<ConfigurableApplicationContext>) applicationContext -> {
   			new SpringBootRuntime().initialize(applicationContext);
   		});
   
   		app.run(args);
   	}
   }
   ```

3. 启动时输出

   ```text
    :: Spring Boot ::                (v3.2.3)
   
   应用上下文初始化器添加了自定义属性源
   2025-03-10T21:52:44.799+08:00  INFO 11596 --- [           main] indi.yuluo.Main  
   ```

## 4. BeanPostProcessor：Bean对象增强处理器

BeanPostProcessor 可以帮助我们在 Bean 初始化前后对 Bean 进行修改或增强，是面向切面编程的重要工具。在一些框架中很常见，不如 spring cloud alibaba 中

```java
public class NacosAnnotationProcessor implements BeanPostProcessor, PriorityOrdered, ApplicationContextAware 
{
    // ......
}
```

## 5. EnvironmentPostProcessor：环境配置后处理器

`EnvironmentPostProcessor` 是 Spring Framework 中的一个接口，允许开发者在 Spring 应用程序上下文的环境（`Environment`）准备好之后但在上下文刷新之前进行自定义处理。主要用于在 Spring Boot 应用的启动过程中对环境进行修改和增强。

相比于**ApplicationContextInitializer** ，**EnvironmentPostProcessor** 更加专注于 `Environment` 的处理，适用于配置和属性管理。

```java
public class PropertyFileEnvironmentPostProcessor implements EnvironmentPostProcessor {
    
    private final YamlPropertySourceLoader loader = new YamlPropertySourceLoader();
    
    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        // 自定义环境变量处理逻辑
        // 例如，根据环境加载不同的配置文件
        String env = environment.getProperty("spring.profiles.active", "default");
        Resource resource = new ClassPathResource(String.format("config/%s-config.yml", env));
        
        try {
            // 加载特定环境的配置文件
            PropertySource<?> propertySource = this.loader
                .load("environmentSpecificConfig", resource)
                .get(0);
            environment.getPropertySources().addLast(propertySource);
            log.info("已加载环境特定配置：{}", resource.getFilename());
        } catch (IOException e) {
            log.warn("无法加载环境特定配置文件", e);
        }
    }
}
```

通过在 `META-INF/spring.factories`注册进行使用：

```text
org.springframework.boot.env.EnvironmentPostProcessor=\
com.example.PropertyFileEnvironmentPostProcessor
```

## 6. ApplicationListener：应用事件监听器

`ApplicationListener` 是 Spring Framework 中的一个接口，用于监听 Spring 应用上下文中的事件。通过实现 `ApplicationListener` 接口，你可以在应用程序中处理各种事件，例如上下文刷新、应用启动、Bean 注册等。

```java
@Component
public class ApplicationStartupListener implements ApplicationListener<ApplicationStartedEvent> {
    
    @Override
    public void onApplicationEvent(ApplicationStartedEvent event) {
        // 响应应用启动事件
        // ApplicationStartedEvent在应用上下文刷新后、CommandLineRunner执行前触发
        long startupTime = event.getTimestamp();
        long uptime = System.currentTimeMillis() - startupTime;
        log.info("应用启动完成，花费时间: {}ms", uptime);
        
        // 可以在这里执行其他需要应用完全启动后的逻辑
        // 如初始化缓存、建立监控等
    }
}
```

## 7. BeanFactoryPostProcessor：Bean 修改器

`BeanFactoryPostProcessor` 是 Spring Framework 中的一个接口，用于在 Spring 容器的 `BeanFactory` 标准初始化之后、Bean 实例化之前对 Bean 定义进行修改。这个接口允许开发者在应用上下文中自定义和修改 Bean 的定义，提供了强大的扩展能力。

```java
@Component
public class CustomBeanFactoryPostProcessor implements BeanFactoryPostProcessor {

    @Override
    public void postProcessBeanFactory(ConfigurableListableBeanFactory beanFactory) {
        // 修改特定 Bean 的属性
        BeanDefinition beanDefinition = beanFactory.getBeanDefinition("myBean");
        beanDefinition.getPropertyValues().add("propertyName", "newValue");
        System.out.println("BeanFactoryPostProcessor 已执行，修改了 Bean 的属性");
    }
}

// bean 定义如下：

@Component
public class MyBean {
    private String propertyName;

    public void setPropertyName(String propertyName) {
        this.propertyName = propertyName;
    }

    public String getPropertyName() {
        return propertyName;
    }
}

// 之后可以在 spring 容器的任何地方使用 bean
@Component
public class MyCommandLineRunner implements CommandLineRunner {

    @Autowired
    private MyBean myBean;

    @Override
    public void run(String... args) {
        System.out.println("修改后的属性值: " + myBean.getPropertyName());
    }
}
```

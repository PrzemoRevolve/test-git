-- Initial data migration
-- Insert 3 users
INSERT INTO users (name, email) VALUES 
('John Doe', 'john.doe@example.com'),
('Jane Smith', 'jane.smith@example.com'),
('Mike Johnson', 'mike.johnson@example.com');

-- Insert 10 blog posts
INSERT INTO blog_posts (title, content, user_id) VALUES 
('Getting Started with Node.js', 'Node.js is a powerful JavaScript runtime that allows you to build server-side applications. In this post, we will explore the basics of Node.js and how to get started with building your first application.', 1),
('Understanding PostgreSQL', 'PostgreSQL is an advanced open-source relational database system. It offers many features that make it an excellent choice for modern applications, including ACID compliance, extensibility, and standards compliance.', 2),
('Building REST APIs', 'REST APIs are the backbone of modern web applications. They provide a standardized way for different systems to communicate with each other using HTTP methods like GET, POST, PUT, and DELETE.', 1),
('Docker for Beginners', 'Docker is a containerization platform that makes it easy to package and deploy applications. This post will guide you through the basics of Docker and how to containerize your first application.', 3),
('JavaScript ES6 Features', 'ES6 introduced many new features to JavaScript that make the language more powerful and easier to work with. Learn about arrow functions, destructuring, classes, and more in this comprehensive guide.', 2),
('Database Design Best Practices', 'Good database design is crucial for building scalable applications. This post covers normalization, indexing, and other important concepts that will help you design efficient databases.', 1),
('Express.js Middleware', 'Middleware functions are the building blocks of Express.js applications. They have access to the request and response objects and can execute code, modify these objects, or end the request-response cycle.', 3),
('Testing Node.js Applications', 'Testing is an essential part of software development. This post covers different types of testing for Node.js applications, including unit tests, integration tests, and end-to-end tests.', 2),
('Deployment Strategies', 'Deploying applications to production requires careful planning and consideration of various factors. Learn about different deployment strategies and best practices for ensuring smooth deployments.', 1),
('Security in Web Applications', 'Security should be a top priority when building web applications. This post covers common security vulnerabilities and how to protect your applications from malicious attacks.', 3);

-- Insert 30 comments (3 comments per blog post, distributed among the 3 users)
INSERT INTO comments (content, user_id, blog_post_id) VALUES 
-- Comments for post 1
('Great introduction! This really helped me understand the basics of Node.js.', 2, 1),
('Thanks for sharing this. Looking forward to more Node.js content.', 3, 1),
('Very clear explanation. I''m excited to start building with Node.js!', 2, 1),

-- Comments for post 2
('PostgreSQL is indeed powerful. I''ve been using it for years and love it.', 1, 2),
('Nice overview of PostgreSQL features. The ACID compliance part was particularly helpful.', 3, 2),
('Great post! Could you write more about PostgreSQL performance tuning?', 1, 2),

-- Comments for post 3
('REST APIs are everywhere these days. This is a solid foundation post.', 2, 3),
('Good explanation of HTTP methods. The examples were very helpful.', 3, 3),
('I''m building my first API and this post came at the perfect time!', 2, 3),

-- Comments for post 4
('Docker has revolutionized how we deploy applications. Great beginner guide!', 1, 4),
('The containerization concept was well explained. Thanks for this post.', 2, 4),
('Just started with Docker last week. This post filled in some gaps for me.', 1, 4),

-- Comments for post 5
('ES6 features have made JavaScript so much more enjoyable to work with.', 1, 5),
('Arrow functions are my favorite ES6 feature. Great comprehensive guide!', 3, 5),
('Destructuring has saved me so much time. Thanks for the detailed examples.', 1, 5),

-- Comments for post 6
('Database design is often overlooked but so important. Great tips here.', 2, 6),
('The normalization section was particularly useful. Thanks for sharing!', 3, 6),
('I wish I had read this before designing my first database. Excellent post!', 2, 6),

-- Comments for post 7
('Middleware is such a powerful concept in Express. Well explained!', 1, 7),
('The examples really helped me understand how middleware works in practice.', 2, 7),
('Great post! Could you cover error handling middleware in a future post?', 1, 7),

-- Comments for post 8
('Testing is crucial but often skipped. Thanks for emphasizing its importance.', 2, 8),
('The different types of testing were well explained. Very informative post.', 3, 8),
('I need to improve my testing practices. This post gave me a good starting point.', 2, 8),

-- Comments for post 9
('Deployment can be tricky. These strategies will definitely help me.', 1, 9),
('Blue-green deployment sounds interesting. Thanks for the overview!', 3, 9),
('Great practical advice. I''ve experienced some of these deployment issues firsthand.', 1, 9),

-- Comments for post 10
('Security is so important and often an afterthought. Great reminder!', 1, 10),
('The OWASP Top 10 reference was very helpful. Thanks for including that.', 2, 10),
('I''m bookmarking this post for future reference. Excellent security overview.', 1, 10);
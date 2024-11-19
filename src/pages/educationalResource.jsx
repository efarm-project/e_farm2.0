import React, { useState } from 'react';
import Navbar from "../components/navbar"; // Ensure Navbar component exists
import './styles/educationalResource.css'; // CSS file for styles

const EdResource = () => {
    const [posts, setPosts] = useState([]);
    const [newPost, setNewPost] = useState('');
    const [newImage, setNewImage] = useState(null);

    const handlePostSubmit = () => {
        if (newPost.trim() || newImage) {
            setPosts([...posts, { id: posts.length + 1, text: newPost, image: newImage, comments: [] }]);
            setNewPost('');
            setNewImage(null);
        }
    };

    const handleCommentSubmit = (postId, comment) => {
        setPosts(posts.map(post => 
            post.id === postId 
                ? { ...post, comments: [...post.comments, comment] } 
                : post
        ));
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => setNewImage(reader.result);
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="edResource">
            <Navbar />
            <h1>Education Page</h1>
            
            <section className="resources">
                <div className="resource-cards">
                    <div className="card">
                        <h3>Guide to Organic Farming</h3>
                        <p>Learn the principles of organic farming to boost sustainability.</p>
                        <a href="#">Read More</a>
                    </div>
                    <div className="card">
                        <h3>Pest Management Strategies</h3>
                        <p>Explore effective techniques to manage pests and protect your crops.</p>
                        <a href="#">Read More</a>
                    </div>
                    <div className="card">
                        <h3>Efficient Irrigation Methods</h3>
                        <p>Discover how to save water while keeping your crops healthy.</p>
                        <a href="#">Read More</a>
                    </div>
                </div>
            </section>
            
            <section className="discussion">
                <h2>Discussion Forum</h2>
                <div className="post-form">
                    <textarea 
                        value={newPost} 
                        onChange={(e) => setNewPost(e.target.value)} 
                        placeholder="Describe the crop issue or share an idea..." 
                    />
                    <input type="file" accept="image/*" onChange={handleImageUpload} />
                    <button onClick={handlePostSubmit}>Post</button>
                </div>
                <div className="posts">
                    {posts.map(post => (
                        <div key={post.id} className="post">
                            <p>{post.text}</p>
                            {post.image && <img src={post.image} alt="Crop issue" className="post-image" />}
                            <div className="comments">
                                <h4>Comments</h4>
                                {post.comments.map((comment, index) => (
                                    <p key={index}>{comment}</p>
                                ))}
                                <textarea 
                                    placeholder="Add a comment..." 
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            handleCommentSubmit(post.id, e.target.value);
                                            e.target.value = '';
                                        }
                                    }} 
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default EdResource;

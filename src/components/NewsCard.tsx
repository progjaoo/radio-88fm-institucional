interface NewsCardProps {
  title: string;
  image: string;
  category: string;
  link: string;
}

const NewsCard = ({ title, image, category, link }: NewsCardProps) => {
  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className="group block overflow-hidden rounded-lg bg-card shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="relative aspect-video overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <span className="news-badge absolute bottom-2 left-2">{category}</span>
      </div>
      <div className="p-3">
        <h3 className="font-display text-sm font-bold leading-tight text-card-foreground line-clamp-3 group-hover:text-primary transition-colors">
          {title}
        </h3>
      </div>
    </a>
  );
};

export default NewsCard;

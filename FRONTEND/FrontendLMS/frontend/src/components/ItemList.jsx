/**
 * ItemList: Reusable list component
 * Handles: Displaying lists of items (courses, users, etc.)
 * Props: items, renderItem, onAction, title, emptyMessage
 */
function ItemList({
  items = [],
  renderItem,
  onAction,
  title = "Items",
  emptyMessage = "No items to display.",
  className = "",
}) {
  if (!items || items.length === 0) {
    return (
      <section className={`card list-section ${className}`}>
        <h2>{title}</h2>
        <p className="empty-state">{emptyMessage}</p>
      </section>
    );
  }

  return (
    <section className={`card list-section ${className}`}>
      <h2>{title}</h2>
      <ul className="item-list">
        {items.map((item) => (
          <li key={item.id} className="list-item">
            {renderItem(item, onAction)}
          </li>
        ))}
      </ul>
    </section>
  );
}

export default ItemList;

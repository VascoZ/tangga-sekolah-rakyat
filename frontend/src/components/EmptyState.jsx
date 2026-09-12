/** Reusable empty/zero-result state so "nothing here" always looks intentional. */
function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="bg-white rounded-xl shadow-card py-16 px-6 text-center">
      {Icon && (
        <div className="w-14 h-14 rounded-full bg-sr-50 flex items-center justify-center mx-auto mb-4">
          <Icon className="w-7 h-7 text-sr-400" />
        </div>
      )}
      <h3 className="font-display text-lg font-semibold text-sr-900 mb-1">{title}</h3>
      {description && <p className="text-sr-500 max-w-sm mx-auto">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export default EmptyState

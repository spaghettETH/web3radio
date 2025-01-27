import { FaTwitch, FaYoutube } from 'react-icons/fa';

const platforms = [
  {
    name: 'Twitch',
    icon: FaTwitch,
  },
  {
    name: 'YouTube',
    icon: FaYoutube,
  },
];

const StreamPlatformBanner = () => {
  return (
    <div className="bg-white shadow rounded-lg p-4">
      <h3 className="text-lg font-medium text-gray-900 mb-3">
        Piattaforme disponibili
      </h3>
      <div className="space-y-2">
        {platforms.map((platform) => (
          <div
            key={platform.name}
            className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-md"
          >
            <platform.icon className="w-5 h-5 text-gray-600" />
            <span className="text-gray-700">{platform.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StreamPlatformBanner;

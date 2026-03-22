<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ProjectTemplate;

class ProjectTemplateSeeder extends Seeder
{
    public function run(): void
    {
        $templates = [
            [
                'name' => 'Software Development',
                'slug' => 'software-development',
                'description' => 'Ideal for building new features or applications. Includes steps like Requirements, Coding, and QA.',
                'icon' => 'Code',
                'tasks' => [
                    ['name' => 'Requirements Analysis', 'status' => 'pending'],
                    ['name' => 'Architecture & Design', 'status' => 'pending'],
                    ['name' => 'Backend Development', 'status' => 'pending'],
                    ['name' => 'Frontend Development', 'status' => 'pending'],
                    ['name' => 'Quality Assurance (QA)', 'status' => 'pending'],
                    ['name' => 'Deployment', 'status' => 'pending'],
                ],
            ],
            [
                'name' => 'Marketing Campaign',
                'slug' => 'marketing-campaign',
                'description' => 'Perfect for planning and executing product launches or social media campaigns.',
                'icon' => 'Megaphone',
                'tasks' => [
                    ['name' => 'Market Research', 'status' => 'pending'],
                    ['name' => 'Content Strategy', 'status' => 'pending'],
                    ['name' => 'Asset Creation (Graphics/Video)', 'status' => 'pending'],
                    ['name' => 'Ad Campaign Setup', 'status' => 'pending'],
                    ['name' => 'Monitoring & Optimization', 'status' => 'pending'],
                    ['name' => 'Final Report', 'status' => 'pending'],
                ],
            ],
            [
                'name' => 'Website Redesign',
                'slug' => 'website-redesign',
                'description' => 'A structured approach to refreshing your online presence.',
                'icon' => 'Layout',
                'tasks' => [
                    ['name' => 'Brand Guidelines Review', 'status' => 'pending'],
                    ['name' => 'UX Audit & Sitemap', 'status' => 'pending'],
                    ['name' => 'Wireframing', 'status' => 'pending'],
                    ['name' => 'UI Design', 'status' => 'pending'],
                    ['name' => 'Vite/React Implementation', 'status' => 'pending'],
                    ['name' => 'SEO Optimization', 'status' => 'pending'],
                ],
            ],
        ];

        foreach ($templates as $template) {
            ProjectTemplate::updateOrCreate(['slug' => $template['slug']], $template);
        }
    }
}
